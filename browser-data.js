var _ = require('lodash')

var wikipediaDb = require('./db/wikipediaDb')
var browsersDb = require('./db/browsersDb')
var mdnDb = require('./db/mdnDb')
var enginesPrefixes = require('./db/enginesPrefixes')
var versionsHelpers = require('./versionsHelpers')
var findLastVersion = versionsHelpers.findLastVersion
var compareVersions = versionsHelpers.compareVersions

// Returns browsersDb content whith an array of sorted versions for each browser
var browserNames = _.keys(browsersDb)
var browsers = browserNames.reduce(function (acc, name) {
  var versions = _.keys(browsersDb[name])
  versions.sort(compareVersions)
  acc[name] = _.assign({versions}, browsersDb[name])
  return acc
}, {})

/* API */

// Uses engineSupportDb
var getEngine = function getEngine (browser) {
  if (browserNames.indexOf(browser.name) === -1) {
    return undefined
  }
  var browserData = browsers[browser.name]
  var browserVersion = findLastVersion(browserData.versions, browser.version)
  return browserData[browserVersion]
}

// Uses mdnDb
var browserSupport = function browserSupport (browser, property) {
  var splited = splitPrefix(property)
  var prefix = splited.prefix
  var property = splited.property

  var browsers = {
    'Firefox': 'f',
    'Android': 'a',
    'Safari': 's',
    'Chrome': 'c',
    'Opera': 'o',
    'IE': 'ie',
    'IEMobile': 'iem',
  }
  var browserId = browsers[browser.name]
  if (!mdnDb.hasOwnProperty(property)) {
    // Fallback to wikipedia database
    return browserSupport_(browser, property)
  } else {
    var supports = mdnDb[property].c.bs[browserId]
    var defaultSupports = supports.filter((s) => s.p === prefix)
    if (defaultSupports.length === 0) {
      return undefined
    }
    var version = defaultSupports[0].v
    switch (version) {
      case 'yes':
        return true
      case 'no':
        return false
      case '-':
      case '?':
        return undefined
      // case undefined:
      //   console.log(mdnDb[property])
      default:
        return compareVersions(version, browser.version) <= 0
    }
  }
  return undefined
}

// Uses engineSupportDb
var browserSupport_ = function browserSupport (browser, property) {
  var engine = getEngine(browser)
  return engineSupport(engine, property)
}

// Uses engineSupportDb
var engineSupport = function engineSupport (engine, property) {
  const originalProperty = property
  property = removePrefix(engine, property)
  if (!wikipediaDb.hasOwnProperty(property)) {
    console.log(`property not in database: ${property} (${originalProperty})`)
    return undefined
  }
  if (!wikipediaDb[property].hasOwnProperty(engine.name)) {
    // MSHTML fallback
    if (engine.name === 'MSHTML' && wikipediaDb[property].hasOwnProperty('Trident')) {
      engine = {name: 'Trident', version: '3'}
    } else {
      console.log(`${engine.name} not in database for property ${property}`)
      console.log(wikipediaDb[property])
      return undefined
    }
  }
  var support = wikipediaDb[property][engine.name].toLowerCase()
  switch (support) {
    case 'yes':
      return true
    case 'no':
      return false
    default:
      return support <= engine.version
  }
  return undefined
}

/* Helpers */

function splitPrefix (property) {
  var prefixes = _.uniq(_.flatten(_.values(enginesPrefixes))).map((p) => p.replace(/-/g, ''))
  var prefix = ''
  prefixes.forEach(function (curPrefix) {
    var pty = property.replace(new RegExp('^-?' + curPrefix + '-'), '')
    if (pty !== property) {
      property = pty
      prefix = '-' + curPrefix
    }
  })
  return {prefix, property}
}

function removePrefix (engine, property) {
  enginesPrefixes[engine.name].forEach(function (prefix) {
    property = property.replace(new RegExp('^' + prefix), '')
  })
  return property
}

module.exports = { getEngine, browserSupport, engineSupport, browsers}
