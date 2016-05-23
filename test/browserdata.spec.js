var chai = require('chai')
var expect = chai.expect

var bdata = require('../browser-data')

describe('browserData', function () {
  describe('getEngine', function () {
    it('should support major browsers', function () {
      expect(bdata.getEngine({name: 'Firefox', version: '3'})).to.not.equal(undefined)
      expect(bdata.getEngine({name: 'Android', version: '3.0'})).to.not.equal(undefined)
      expect(bdata.getEngine({name: 'Safari', version: '3.0'})).to.not.equal(undefined)
      expect(bdata.getEngine({name: 'Chrome', version: '3.0'})).to.not.equal(undefined)
      expect(bdata.getEngine({name: 'Opera', version: '12.00'})).to.not.equal(undefined)
      expect(bdata.getEngine({name: 'IE', version: '6'})).to.not.equal(undefined)
      expect(bdata.getEngine({name: 'IEMobile', version: '7'})).to.not.equal(undefined)
    })
    it('should return the engine and version when the exact version is not known in database', function () {
      var engineData = bdata.getEngine({name: 'Firefox', version: '3.5.5'})
      expect(engineData.name).to.equal('Gecko')
      expect(engineData.version).to.equal('1.9.1')
    })
  })

  describe('browserSupport', function () {
    it('should return false if a property is not supported', function () {
      expect(bdata.browserSupport({name: 'Firefox', version: '3'}, 'border-radius')).to.equal(false)
    })
    it('should return true if a property is supported', function () {
      expect(bdata.browserSupport({name: 'Firefox', version: '3'}, 'border-color')).to.equal(true)
    })
    it('should return undefined if a property is not known', function () {
      expect(bdata.browserSupport({name: 'Firefox', version: '3'}, 'gloubiboulga')).to.equal(undefined)
    })
  // it('should fallback to Trident 3 for MSHTML', function () {
  //   expect(bdata.browserSupport({name: 'IE', version: '6'}, 'border-collapse')).to.equal(false)
  // })
  })

  describe('removePrefix', function () {
    it('should translate prefixed properties', function () {
      expect(bdata.browserSupport({name: 'Firefox', version: '20'}, '-moz-animation')).to.equal(true)
    })
    it('should not translate prefixed properties of other engines', function () {
      expect(bdata.browserSupport({name: 'Firefox', version: '20'}, '-ms-animation')).to.equal(undefined)
    })
  })
})
