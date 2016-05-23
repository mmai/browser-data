var _ = require('lodash')
var compareVersions = require('../versionsHelpers').compareVersions

module.exports = function (mdnDb) {
  return Object.keys(mdnDb)
    .reduce((db, propertyName) => {
      var properties = makeProperties(mdnDb[propertyName])
      properties.map((p) => {
        db[p.n] = p})
      return db
    }, {})
}

function makeProperties (pty) {
  var properties = []

  // Special cases
  switch (pty.n) {
    case '::after (:after)':
      properties.push(makePropertyFromCompat(pty, ':after support', ':after'))
      properties.push(makePropertyFromCompat(pty, '::after support', '::after'))
      break
    case '::before (:before)':
      properties.push(makePropertyFromCompat(pty, ':before support', ':before'))
      properties.push(makePropertyFromCompat(pty, '::before support', '::before'))
      break
    default:
      properties.push(translateProperty(pty))
  }

  return properties
}

function translateProperty (property) {
  var supportNames = Object.keys(property.c)

  property.c = supportNames.reduce((acc, supportName) => {
    acc[supportName] = property.c[supportName]
    // Search 'Basic support (something)' items
    // if (supportName.indexOf('Basic support') !== -1) {
    //   acc['bs'] = property.c[supportName]
    // }
    return acc
  }, {})

  supportNames = Object.keys(property.c)
  if (supportNames.indexOf('bs') === -1 && supportNames.length > 0) {
    property.c.bs = computeBasicSupport(property.c)
  }

  return property
}

function computeBasicSupport (compat) {
  var bs = {}
  _.values(compat).map((support) => {
    Object.keys(support).map((browserName) => {
      var tsupports = translateSupports(support[browserName])
      if (!bs.hasOwnProperty(browserName)) {
        bs[browserName] = tsupports
      } else {
        bs[browserName] = minimumCompat(bs[browserName], tsupports)
      }
    })
  })
  return bs
}

function minimumCompat (ca, cb) {
  // console.log(ca)
  var cDict = {}
  ca.map((c) => {
    var key = (c.p === '') ? '-' : c.p
    cDict[key] = c.v
  })

  cb.map((c) => {
    var key = (c.p === '') ? '-' : c.p
    if (!cDict.hasOwnProperty(key)) {
      cDict[key] = c.v
    } else {
      var minver = getMinimumVersion([cDict[key], c.v])
      cDict[key] = minver
    }
  })

  return Object.keys(cDict).map((k) => {
    var p = (k === '-') ? '' : k
    return {p, v: cDict[k]}
  })
}

function getMinimumVersion (versions) {
  return versions.sort(compareVersions)[0]
}

function makePropertyFromCompat (pty, compat, name) {
  var bs = {}
  Object.keys(pty.c[compat]).map((browserName) => {
    bs[browserName] = translateSupports(pty.c[compat][browserName])
  })

  return {
    n: name,
    t: pty.t,
    c: { bs}
  }
}

function translateSupports (supports) {
  return supports.map((s) => {
    var v = s.v
    return {p: s.p, v}
  })
}
