const {JSDOM} = require('jsdom')

const jsdom = new JSDOM('<!doctype html><html><body></body></html>')
const {window} = jsdom
const raf = require('raf')

raf.polyfill()

function copyProps(src, target) {
  const props = Object.getOwnPropertyNames(src)
    .filter(prop => typeof target[prop] === 'undefined')
    .reduce((result, prop) => ({
      ...result,
      [prop]: Object.getOwnPropertyDescriptor(src, prop)
    }), {})
  Object.defineProperties(target, props)
}

global.window = window
global.document = window.document
copyProps(window, global)
