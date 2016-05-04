var jsdom = require('jsdom')
var fs = require('fs')

var associatedProperties = require('./associatedProperties')

var outputFile = './engineSupportDb.json'

jsdom.env(
  // 'https://en.wikipedia.org/w/index.php?title=Comparison_of_layout_engines_%28Cascading_Style_Sheets%29&printable=yes',
  './tools/Comparison_of_layout_engines.html',
  ['http://code.jquery.com/jquery.js'],
  function (err, window) {
    var db = {}

    // Properties
    var tableElem = window.$('#Properties').parent().next().get()[0]
    var tableElements = normalizeTableContents(tableElem)
    db = makeJsonFromTableElements(db, tableElements)

    // Grammar and rules
    tableElem = window.$('#Grammar_and_rules').parent().next().get()[0]
    tableElements = normalizeTableContents(tableElem)
    db = makeJsonFromTableElements(db, tableElements)

    fs.writeFile(outputFile, JSON.stringify(db))
  }
)

/**
 * makeJsonFromTableElements
 *
 * @param table {Array}
 * @return {string}
 */
function makeJsonFromTableElements (db, table) {
  var propertyColumnIdx = 1 // properties are on the second column of the table

  // Get browser engines
  var engines = {}
  table.shift().map(function (cell, i) {
    var name = cell.textContent.trim()
    if (name !== '') engines[i] = name
  })

  // Get properties support
  table.map(row => {
    var td = row[propertyColumnIdx]
    if (td) {
      var propertyElem = td.firstChild
      if (propertyElem && propertyElem.tagName === 'CODE') {
        var property = propertyElem.textContent

        Object.keys(engines).map(function (pos) {
          var engine = engines[pos]
          var support = parseSupport(row[pos].textContent)
          addPropertiesSupport(db, engine, getAssociatedProperties(property), support)
        })
      }
    }
  })
  return db
}

function addPropertiesSupport (db, engine, properties, support) {
  properties.map(function (property) {
    if (!db.hasOwnProperty(property)) db[property] = {}
    db[property][engine] = support
  })
}

function getAssociatedProperties (property) {
  return associatedProperties[property] || [property]
}

function parseSupport (txt) {
  return txt.replace(/\[[^\]]*\]/, '').trim()
}

/**
 * normalizeTableContents
 * return a matrix of elements contained in a table, with rowspans and colspans managed
 * es2015 source: http://stackoverflow.com/a/33059196/1409625
 *
 * @param table {DOMElement}
 * @return {Array} Array of Arrays of DOMElements
 */
function normalizeTableContents (table) {
  var width = Array.from(table.rows[0].cells).reduce(function (a, v) {
    return a + parseInt(v.colSpan, 10)
  }, 0)
  var M = Array.from(Array(table.rows.length), function (_) {
    return Array(width).fill(null)
  })
  for (var i = 0, len = table.rows.length; i < len; i++) {
    var tr = table.rows[i]
    for (var j = 0, k = 0, jlen = tr.cells.length; j < jlen; j++) {
      var td = tr.cells[j]
      k = M[i].indexOf(null, k)
      for (var r = 0; r < parseInt(td.rowSpan); r++) {
        var _M

        ;(_M = M[i + r]).splice.apply(_M, [k, parseInt(td.colSpan)].concat(_toConsumableArray(Array(parseInt(td.colSpan)).fill(td))))
      }
    }
  }
  return M
}

function _toConsumableArray (arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }
