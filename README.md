# Browser data

Check CSS properties support on major browsers

## Usage

```javascript
var bdata =  require('browser-data')

var browser = {name: "Firefox", version: "3"}
console.log(bdata.getEngine(browser)) // {name: 'Gecko', version: '1.9.1'}

console.log(bdata.browserSupport(browser, "border-radius")) // false
console.log(bdata.browserSupport(browser, "border-color")) // true
```

## Database sources

Support database was built from the MDN CSS reference pages, it is the most complete and reliable source of information I've found. Mozilla is working on a project which will give access to this data with an API, no release date have been specified. In the meantime the data is gathered by scrapping the web pages, which unfortunately are not standardized and not complete (this is a collective effort, don't hesitate to contribute to the documentation on [MDN Developper Network](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference)).

### Rebuilding the database

`make supportdb`

Generates db/mdnDb.json with the following structure : 

```javascript
{
":active":{
  "n":":active",
  "t":[
    "CSS Pseudo-class",
    "Layout"
  ],
  "c":{
    "bs":{
      "c":[
        {"p":"","v":"1.0"}
      ],
      "f":[
        {"p":"","v":"1.0 (1.7 or earlier)"}
      ]
    }
  }
}
}
```


Main Object has CSS properties as key names
Property object :
'n' (name)
't' (tags)
'c' (compatibilities) : object whith compatibilities name as keys
  'bs' stands for 'Basic support'

Each compatibility line is an object with browser id as keys :
    'c' : Chrome
    'f' : Firefox
    'e' : Internet Explorer Edge
    'ie': Internet Explorer
    'o' : Opera
    's' : Safari
    'a' : Android
    'aw': Android Webview
    'fo': Firefox OS
    'fm': Firefox Mobile
    'iem': Internet Explorer Mobile
    'om' : Opera Mobile
    'sm' : Safari Mobile
    'cm' : Chrome for Android

Each browser object is an array of prefix / version tuples : 
  'p' : prefix
  'v' : version


### Alternate source 2

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
