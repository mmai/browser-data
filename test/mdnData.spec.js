var chai = require('chai')
var expect = chai.expect
var _ = require('lodash')

var bd = require('../db/mdnDb')

describe('normalized', function () {
  it('should have defined browsers', function () {
    var browsers = fetchBrowsers()
    expect(browsers).to.deep.equal([
      'a', 'aw', 'c', 'ca', 'e', 'f', 'fm' , 'fo' , 'ie', 'iem', 'o', 'om', 's', 'sm'
    ])
  })

  it('should have basic support entry or no support entry at all', function () {
    var missingBasicSupport = _.values(bd).reduce((acc, prop) => {
      var supportsNames = Object.keys(prop.c)
      if (supportsNames.indexOf('bs') === -1)
        acc[prop.n] = supportsNames
      return acc
    }, {})

    var nonEmptyMissing = _.values(missingBasicSupport).filter((s) => (s.length > 0))
    expect(nonEmptyMissing.length).to.equal(0)
  })

  it('should have correct versions format', function () {
    var versions = fetchVersions()
    versions.map((v) => {
      expect(checkVersionFormat(v)).to.be.true
    })
  })
})

function checkVersionFormat (v) {
  var allowed = ['?', 'yes', 'no', '-']
  var velems = v.split('.').map((c) => parseInt(c, 10))
  return _.every(velems, _.isInteger) || (allowed.indexOf(v) !== -1)
}

function fetchBrowsers () {
  var compatibilities = _.values(bd).map(p => p.c)
  var supports = _.flatten(compatibilities.map(_.values))
  var browsers = _.uniq(_.flatten(supports.map(Object.keys)))
  return browsers.sort()
}

function fetchVersions () {
  var compatibilities = _.values(bd).map(p => p.c)
  var supports = _.flatten(compatibilities.map(_.values))
  var browsers = _.flatten(supports.map(_.values))
  var prefixes = _.flatten(browsers)
  var versions = _.uniq(_.flatten(prefixes.map((p) => p.v)))
  return versions.sort()
}
