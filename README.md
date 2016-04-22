# Browser data

Check CSS properties support on major browsers

## Usage

```javascript
var bdata =  require('browser-data')

console.log(bdata.getEngine("Firefox", "3")) // {engine: 'Gecko', version: '1.9.1'}

console.log(bdata.browserSupport("Firefox", "3", "border-radius")) // false
console.log(bdata.browserSupport("Firefox", "3", "border-color")) // true
```

## Database sources

Support database was built from the wikipedia page https://en.wikipedia.org/w/index.php?title=Comparison_of_layout_engines_%28Cascading_Style_Sheets%29 (see `tools/wikipediaScraper.js`)

Browsers / engines versions matches comes from these sources : 

* Firefox: https://developer.mozilla.org/en-US/docs/Mozilla/Gecko/Versions
* Safari: https://en.wikipedia.org/wiki/Safari_version_history
* Android: https://decadecity.net/blog/2013/11/21/android-browser-versions
* Chrome: http://www.useragentstring.com/pages/Chrome/
* Opera: http://www.opera.com/docs/history/presto/
* Internet Explorer: https://en.wikipedia.org/wiki/Trident_%28layout_engine%29#Release_history

## Todo

* script to update new browser versions engines
* check selectors support
* check descriptors support
* check grammar and rules support
* check values and units support
* add IE < 8.0 css support info from https://msdn.microsoft.com/en-us/library/cc351024%28VS.85%29.aspx
