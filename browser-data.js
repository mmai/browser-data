var propertiesDb = require('./engineSupportDb')
var browsersDb = require('./browsersDb')

var browsers = Object.keys(browsersDb)

var getEngine = function getEngine (browser, version){
  if (browsers.indexOf(browser) === -1 ){
    return undefined; 
  }
  var browserData = browsersDb[browser]
  var browserVersion = findLastVersion(Object.keys(browserData), version)
  return browserData[browserVersion];
}

function findLastVersion(versions, version){
  if (versions.indexOf(version) > -1) {
    return version
  } else {
    //Return the previous version
    versions.push(version)
    versions.sort(compareVersions)
    var idx = versions.indexOf(version)
    if (idx === 0){
      return undefined
    } 
    return versions[idx -1]
  }
  return undefined;
}

function compareVersions(a, b){
  if (a === b) { return 0 }

  var a_components = a.split(".").map(function(s){return parseInt(s, 10)})
  var b_components = b.split(".").map(function(s){return parseInt(s, 10)})

  var len = Math.min(a_components.length, b_components.length)
  for (var i = 0; i < len; i++) {
    if (a_components[i] !== b_components[i]) {
      return a_components[i] - b_components[i]
    }
  }

  return (a_components.length - b_components.length)
}

var browserSupport = function browserSupport (browser, version, property){
  var engine = getEngine(browser, version)
  return engineSupport(engine.engine, engine.version, property);
}

var engineSupport = function engineSupport(engine, version, property){
  var support = propertiesDb[property][engine].toLowerCase()
  switch(support){
  case 'yes':
    return true;
  case 'no':
    return false;
  default:
    return support <= version
  }
  return undefined;
}

module.exports = {
  getEngine: getEngine,
  browserSupport: browserSupport,
  engineSupport: engineSupport,
}
