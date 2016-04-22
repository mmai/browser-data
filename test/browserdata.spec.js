var chai = require("chai");
var expect = chai.expect;

var bdata =  require('../browser-data')

describe( 'browserData', function() {
    describe( 'getEngine', function() {
        it('should support major browsers', function(){
            expect(bdata.getEngine("Firefox", "3")).to.not.equal(undefined)
            expect(bdata.getEngine("Android", "3.0")).to.not.equal(undefined)
            expect(bdata.getEngine("Safari", "3.0")).to.not.equal(undefined)
            expect(bdata.getEngine("Chrome", "3.0")).to.not.equal(undefined)
            expect(bdata.getEngine("Opera", "12.00")).to.not.equal(undefined)
            expect(bdata.getEngine("IE", "6")).to.not.equal(undefined)
            expect(bdata.getEngine("IEMobile", "7")).to.not.equal(undefined)
          });
        it('should return the engine and version when the exact version is not known in database', function(){
            var engineData = bdata.getEngine("Firefox", "3.5.5")
            expect(engineData.engine).to.equal('Gecko')
            expect(engineData.version).to.equal('1.9.1')
          });
      });
    describe( 'browserSupport', function() {
        it('should return false if a property is not supported', function(){
            expect(bdata.browserSupport("Firefox", "3", "border-radius")).to.equal(false)
          });
        it('should return true if a property is supported', function(){
            expect(bdata.browserSupport("Firefox", "3", "border-color")).to.equal(true)
          });
      });
  });
