var parseKeyword = require('./mdnParser').parseKeyword

var jsdom = require('jsdom')
var fs = require('fs')
var Promise = require('bluebird')
var postProcess = require('./mdnPostprocess')

const outputFile = './db/mdnDb.json'
const workDir = './work/'
const jqueryUrl = `file://${__dirname}/../work/jquery.js`
// Make the mirror whith `make mdnmirror`, then launch the local webserver on port 8000 in work/ directory `make servemirror`
const mdnUrl = `http://localhost:8000/developer.mozilla.org/en-US/docs/Web/CSS/Reference.html`
// const mdnUrl = `http://developer.mozilla.org/en-US/docs/Web/CSS/Reference`

const concurrency = 8 // nb of parallel requests
const batchSize = 50 // dump data every batchSize elements
const batchStart = 0 // If you need to restart after a crash

getUrls().then(
  (urls) => populateDb(urls),
  (err) => console.log(err)
)

/**
 * finish
 * Merge json parts, post process data then store global database json file
 *
 * @return 
 */
function finish () {
  var partsDir = workDir + 'mdnDb-parts/'
  fs.readdir(partsDir, function (err, files) {
    var rawdb = {}
    files.map(file => {
      var part = JSON.parse(fs.readFileSync(partsDir + file))
      Object.keys(part).map((k) => rawdb[k] = part[k])
    })
    // Keep track of non post processed data
    fs.writeFile(workDir + 'rawDb.json', JSON.stringify(rawdb))

    // Post processing
    var db = postProcess(rawdb)
    fs.writeFile(outputFile, JSON.stringify(db))
  })
}

function populateDb (urls) {
  // Parse each found keyword page
  var urlsLen = urls.length

  if (batchStart > urlsLen) {
    finish()
  } else {
    processUrls(batchStart)
  }

  function processUrls (pos) {
    console.log('>>>>', pos)
    var db = {}
    Promise.map(urls.slice(pos, pos + batchSize),
      (url) => parsedKeywordPagePromise(url).then(
        (kw) => {
          console.log('DONE', url); db[kw.n] = kw},
        (err) => {
          console.log(err, url)}
      ),
      {concurrency}
    )
      .then(function () {
        fs.writeFile(`${workDir}mdnDb-parts/${pos}.json`, JSON.stringify(db))
        console.log('Node memory usage:', toMB(process.memoryUsage()['heapUsed']) + ' MB')
        pos += batchSize
        ;(pos < urlsLen) ? processUrls(pos) : finish()
      },
        function (error) {
          console.log('Some promise rejected:', error.message)
          console.log('Node memory usage:', toMB(process.memoryUsage()['heapUsed']) + ' MB')
        }
    )
  }
}

function parsedKeywordPagePromise (url) {
  return new Promise(function (resolve, reject) {
    url = url.replace()
    jsdom.env(url, [jqueryUrl], function (err, window) {
      err ? reject(err) : resolve(parseKeyword(window))
    })
  })
}

function getUrls () {
  var urlsFile = workDir + 'mdnDbUrls.json'
  // var urlsFile = workDir + 'mdnDbUrlsTests.json'

  // Load cached urls from json file if it exists
  if (fs.existsSync(urlsFile)) {
    return new Promise(function (resolve, reject) {
      fs.readFile(urlsFile, function (err, data) {
        if (err) {
          reject(err)
        } else {
          resolve(JSON.parse(data))
        }
      })
    }
    )
  }

  // No json file : parse from MDN index page
  return new Promise(function (resolve, reject) {
    jsdom.env(mdnUrl, [jqueryUrl], function (err, window) {
      if (err) {
        reject(err)
      } else {
        var urls = window.$('.index').filter(':first').find('a').toArray().map((el) => el.href)
        fs.writeFileSync(urlsFile, JSON.stringify(urls))
        resolve(urls)
      }
    }
    )
  })
}

function toMB (byteVal) {
  return (byteVal / 1048576).toFixed(2)
}
