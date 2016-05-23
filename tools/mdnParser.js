var _ = require('lodash')
var tagsToRemove = ['CSS', 'Reference', 'Web']

function parseKeyword (window) {
  const name = window.$('h1')[0].textContent
  const tags = window.$('.tags li a').toArray().map((el) => el.textContent).filter((t) => tagsToRemove.indexOf(t) === -1)
  const compatDesktop = getCompat(window.$('#compat-desktop table'), window)
  const compatMobile = getCompat(window.$('#compat-mobile table'), window)
  var compat = {}
  Object.keys(compatDesktop).map((feature) => {
    compat[feature] = {}
    Object.keys(compatDesktop[feature]).map((b) => {
      var browser = getBrowser(b)
      compat[feature][browser] = compatDesktop[feature][b]
    })
    if (compatMobile[feature]) {
      Object.keys(compatMobile[feature]).map((b) => {
        var browser = getBrowser(b)
        compat[feature][browser] = compatMobile[feature][b]
      })
    }
  })
  return {n: name, t: tags, c: compat}
}

function getCompat (tableElems, window) {
  var nbFound = tableElems.length

  // For some bad formatted pages, we try another search strategy
  if (nbFound === 0) {
    tableElems = window.$('table').has('th:contains("Feature")')
    nbFound = tableElems.length
  }

  var compats = {}

  var candidateId = 0
  var table = []
  while (candidateId < nbFound && table.length === 0){
    table = normalizeTableContents(tableElems[candidateId])
    candidateId += 1
  }

  if (table.length === 0) {
    return {}
  }

  // Get browser engines
  var engines = {}
  table.shift() // Look at first row and remove it from table
    .slice(1) // remove 'feature' column
    .map(function (cell, i) {
      var name = cell.textContent.trim()
      if (name !== '') engines[i] = name
    })

  // Get property support
  table.map((row) => {
    const feature = getFeature(row[0].textContent)
    if (!compats.hasOwnProperty(feature)) {
      compats[feature] = {}
    }
    Object.keys(engines).map(function (pos) {
      const engine = engines[pos]
      if (!compats[feature].hasOwnProperty(engine)) {
        compats[feature][engine] = []
      }
      const cell = row[parseInt(pos) + 1]
      if (cell) {
        parseCompat(cell, window).map((c) => {
          compats[feature][engine].push(c)
        })
      }
    })
  })

  return compats
}

function parseCompat (cell, window) {
  var linesEl = divideByBr(cell, window)

  return linesEl.map((el) => {
    // Parse prefix
    var prefix = ''
    const prefixEls = window.$(el).find('.prefixBox')
    if (prefixEls.length > 0) {
      prefix = prefixEls[0].textContent
      prefixEls[0].remove()
    }

    // Parse version
    var version = el.textContent
      .toLowerCase()
      .replace('(yes)', 'yes')
      .replace('(unprefixed)', '')
      .replace('#', '')
      .replace(/\[[^\]]*\]/g, '') // remove [blah]
      .replace(/\([^)]*\)/, '') // remove (blah)
      .trim()
    switch (version) {
      case 'no support':
      case 'no support': // nbsp
      case 'not supported':
      case 'not supported': // nbsp
        version = 'no'
        break
    }

    var version = version.split(/\s/)[0]
    var elems = version.split('.').map((c) => parseInt(c, 10))
    if (
      ['?', 'yes', 'no'].indexOf(version) === -1 &&
      !(_.every(elems, _.isInteger))
    ) {
      version = '-'
    }

    return {p: prefix, v: version}
  })
}

function getFeature (txt) {
  var feature = txt.replace(' ', ' ') // replace NBSPs
  if (feature.indexOf('Basic support') !== -1) {
    feature = 'bs'
  }
  return feature
}

function getBrowser (txt) {
  var browser = txt
  switch (txt) {
    case 'Chrome':
      browser = 'c'
      break
    case 'Firefox (Gecko)':
    case 'Firefox':
      browser = 'f'
      break
    case 'Edge':
      browser = 'e'
      break
    case 'Internet Explorer':
      browser = 'ie'
      break
    case 'Opera':
    case 'Opera (Presto)':
      browser = 'o'
      break
    case 'Safari (WebKit)':
    case 'Safari':
      browser = 's'
      break
    case 'Android':
    case 'Android Browser':
      browser = 'a'
      break
    case 'Android Webview':
      browser = 'aw'
      break
    case 'Firefox OS (Gecko)':
    case 'Firefox OS':
      browser = 'fo'
      break
    case 'Firefox Mobile (Gecko)':
      browser = 'fm'
      break
    case 'IE Phone':
    case 'IE Phone': // nbsp
    case 'IE Mobile':
    case 'Windows Phone':
      browser = 'iem'
      break
    case 'Opera Mobile':
    case 'Opera Mini':
      browser = 'om'
      break
    case 'Safari Mobile':
    case 'iOS Safari':
      browser = 'sm'
      break
    case 'Chrome for Android':
      browser = 'ca'
      break
  }
  return browser
}

// ============================= UTILS ===================================

function divideByBr (elem, window) {
  var html = elem.innerHTML.replace(' ', ' ') // nbsp
  return html.split('<br>').map((part) => {
    var el = window.document.createElement('div')
    el.innerHTML = part
    return el
  })
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
  if (table.rows.length === 0) return []
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

function _toConsumableArray (arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]} return arr2 } else { return Array.from(arr) } }

module.exports = { parseKeyword}
