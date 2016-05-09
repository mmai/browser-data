var propertiesDb = require('./engineSupportDb')
var browsersDb = require('./browsersDb')

var browsers = Object.keys(browsersDb)

var getEngine = function getEngine (browser) {
  if (browsers.indexOf(browser.name) === -1) {
    return undefined
  }
  var browserData = browsersDb[browser.name]
  var browserVersion = findLastVersion(Object.keys(browserData), browser.version)
  return browserData[browserVersion]
}

function findLastVersion (versions, version) {
  if (versions.indexOf(version) > -1) {
    return version
  } else {
    // Return the previous version
    versions.push(version)
    versions.sort(compareVersions)
    var idx = versions.indexOf(version)
    if (idx === 0) {
      return undefined
    }
    return versions[idx - 1]
  }
  return undefined
}

function compareVersions (a, b) {
  if (a === b) { return 0 }

  var a_components = a.split('.').map(function (s) {return parseInt(s, 10)})
  var b_components = b.split('.').map(function (s) {return parseInt(s, 10)})

  var len = Math.min(a_components.length, b_components.length)
  for (var i = 0; i < len; i++) {
    if (a_components[i] !== b_components[i]) {
      return a_components[i] - b_components[i]
    }
  }

  return (a_components.length - b_components.length)
}

var browserSupport = function browserSupport (browser, property) {
  var engine = getEngine(browser)
  return engineSupport(engine, property)
}

var engineSupport = function engineSupport (engine, property) {
  if (!propertiesDb.hasOwnProperty(property)) {
    console.log(`property not in database: ${property}`)
    return undefined
  }
  if (!propertiesDb[property].hasOwnProperty(engine.name)) {
    // MSHTML fallback
    if (engine.name === 'MSHTML' && propertiesDb[property].hasOwnProperty('Trident')) {
      console.log('MSHTML fallbacks to Trident 3')
      engine = {name: 'Trident', version: '3'}
    } else {
      console.log(`${engine.name} not in database for property ${property}`)
      console.log(propertiesDb[property])
      return undefined
    }
  }

  var support = propertiesDb[property][engine.name].toLowerCase()
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

module.exports = { getEngine, browserSupport, engineSupport, browsersDb}
