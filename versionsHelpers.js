function findLastVersion (versions, version) {
  if (versions.indexOf(version) > -1) {
    return version
  } else {
    // Return the previous version
    var vers = versions.slice(0)
    vers.push(version)
    vers.sort(compareVersions)
    var idx = vers.indexOf(version)
    if (idx === 0) {
      return undefined
    }
    return vers[idx - 1]
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

module.exports = { findLastVersion, compareVersions}
