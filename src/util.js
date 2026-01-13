/******************************************************************************\

                  This file is part of the Folding@home Client.

          The fah-client runs Folding@home protein folding simulations.
                    Copyright (c) 2001-2026, foldingathome.org
                               All rights reserved.

       This program is free software; you can redistribute it and/or modify
       it under the terms of the GNU General Public License as published by
        the Free Software Foundation; either version 3 of the License, or
                       (at your option) any later version.

         This program is distributed in the hope that it will be useful,
          but WITHOUT ANY WARRANTY; without even the implied warranty of
          MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
                   GNU General Public License for more details.

     You should have received a copy of the GNU General Public License along
     with this program; if not, write to the Free Software Foundation, Inc.,
           51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.

                  For information regarding this software email:
                                 Joseph Coffland
                          joseph@cauldrondevelopment.com

\******************************************************************************/

import {ungzip} from 'pako'
import {reactive} from 'vue'


const colors = [
  '#000000',
  '#cd0000',
  '#00cd00',
  '#cdcd00',
  '#0000ee',
  '#cd00cd',
  '#00cdcd',
  '#e5e5e5'
]

const bright = [
  '#7f7f7f',
  '#ff0000',
  '#00ff00',
  '#ffff00',
  '#5c5cff',
  '#ff00ff',
  '#00ffff',
  '#ffffff'
]


const store_timeout = 24 * 60 * 60 * 1000


function pad(t, c = ' ', count = 2) {
  let s = '' + t
  while (s.length < count) s = c + s
  return s
}


function zpad(t, count = 2) {return pad(t, '0', count)}


class Util {
  constructor() {
    this._addressRE = new RegExp(/^(([\w.-]+)(:\d+)?)?(\/[\w.-]+)?$/)
    this._urlbase64_map = {'+': '-', '\/': '_', '=': ''}
    this._base64_map =    {'-': '+', '_': '\/'}

    this.data = reactive({})
    this._tick() // Start timer
  }


  _tick() {
    this.data.now = Date.now()
    setTimeout(() => this._tick(), 250)
  }


  get now() {return this.data.now}


  debounce(cb, delay = 100) {
    let state = {}

    return (...args) => {
      if (state.timer != undefined) {
        state.triggered = true
        state.args = args

      } else {
        cb(...args)

        state.timer = setTimeout(() => {
          if (state.triggered) cb(...state.args)
          delete state.timer
          delete state.triggered
          delete state.args
        }, delay)
      }
    }
  }


  clamp(n, min, max) {return Math.min(Math.max(n, min), max)}


  lock_scrolling() {
    document.body.style.top = `-${window.scrollY}px`
    document.body.style.position = 'fixed' // Must be second
  }


  unlock_scrolling() {
    const scrollY = document.body.style.top
    document.body.style.position = ''
    document.body.style.top = ''
    window.scrollTo(0, parseInt(scrollY || '0') * -1)
  }


  Deferred() {
    const self = this

    this._promise = new Promise((resolve, reject) => {
      self.resolve = resolve
      self.reject = reject
    })

    this.promise = () => self._promise
  }


  isObject(o) {return o != null && typeof o === 'object'}
  isEmpty(o)  {return !Object.keys(o).length}


  copy_props(dst, src) {
    if (src == undefined) return

    for (let key of Object.keys(src))
      if (src[key] != undefined)
        dst[key] = src[key]
  }


  merge_objs(dst, src) {
    Object.entries(src).map(([k, v]) => {
      if (this.isObject(v) && this.isObject(dst[k])) this.merge_objs(dst[k], v)
      else dst[k] = v
    })
  }


  map_object(o, cb) {
    return Object.entries(o).reduce((r, [k, v]) => {
      r[k] = cb(v, k)
      return r
    }, {})
  }


  deepCopy(o) {
    if (Array.isArray(o)) return o.map(v => this.deepCopy(v))
    if (this.isObject(o)) return this.map_object(o, v => this.deepCopy(v))
    return o
  }


  copy_props(dst, src) {
    if (src != undefined) Object.entries(src).map(([k, v]) => dst[k] = v)
  }


  isEqual(a, b) {
    if (typeof a != typeof b) return false

    const keysA = Object.keys(a)
    const keysB = Object.keys(b)

    if (keysA.length != keysB.length) return false

    for (const key of keysA) {
      const valA = a[key]
      const valB = b[key]

      if (this.isObject(valA)) {
        if (!this.isObject(valB) || !this.isEqual(valA, valB)) return false
      } else if (this.isObject(valB) || valA !== valB) return false
    }

    return true
  }


  is_closer(a, b, target) {
    return Math.abs(a - target) < Math.abs(b - target)
  }


  format(s, o) {
    return s.replace(
      /{([^{}]*)}/g,
      (a, b) => {
        const r = o[b]
        return typeof r === 'string' || typeof r === 'number' ? r : a
      }
    )
  }


  human_number(x, precision = 1) {
    if (1e12 <= x) return (x / 1e12).toFixed(precision) + 'T'
    if (1e9  <= x) return (x / 1e9 ).toFixed(precision) + 'B'
    if (1e6  <= x) return (x / 1e6 ).toFixed(precision) + 'M'
    if (1e3  <= x) return (x / 1e3 ).toFixed(precision) + 'K'
    return x
  }


  capitalize(s) {return s ? s.charAt(0).toUpperCase() + s.slice(1) : ''}


  escape_html(s) {
    return s.replace(/[&<>"']/g, c => {
      switch (c) {
      case '&': return '&amp;'
      case '<': return '&lt;'
      case '>': return '&gt;'
      case '"': return '&quot;'
      case "'": return '&#039;'
      }
    })
  }


  ansi2html(s) {
    return this.escape_html(s).replace(
      /\u001b\[(\d+)m(.*?)((\u001b\[0m)|$)/g, (s, m1, m2) => {

        let c = parseInt(m1)
        let fg

        if      ( 30 <= c && c <=  37) {c = colors[c -  30]; fg = true }
        else if ( 40 <= c && c <=  47) {c = colors[c -  40]; fg = false}
        else if ( 90 <= c && c <=  97) {c = bright[c -  90]; fg = true }
        else if (100 <= c && c <= 107) {c = colors[c - 100]; fg = false}
        else return m2

        let style = (fg ? 'color' : 'background') + ':' + c
        return '<font style="' + style + '">' + m2 + '</font>'
      })
  }


  version_parse(v) {
    if (typeof(v) == 'string') v = v.split('.')
    if (v != undefined) return v.map(x => parseInt(x))
    return [0, 0, 0]
  }


  version_less(a, b) {
    a = this.version_parse(a)
    b = this.version_parse(b)

    for (let i = 0; i < a.length || i < b.length; i++) {
      const [A, B] = [a[i] || 0, b[i] || 0]
      if (A < B) return true
      if (B < A) return false
    }

    return false
  }


  remove(key) {
    localStorage.removeItem(key)
    localStorage.removeItem(key + '.__ts__')
  }


  store(key, value) {
    localStorage.setItem(key, JSON.stringify(value))
    localStorage.setItem(key + '.__ts__', new Date().toISOString())
  }


  is_expired(key, timeout = store_timeout) {
    if (!timeout) return false
    let ts = localStorage.getItem(key + '.__ts__')

    try {
      if (Date.now() - new Date(ts).getTime() < timeout) return false
    } catch (e) {}

    return true
  }


  retrieve(key, timeout = store_timeout) {
    try {
      if (!this.is_expired(key, timeout))
        return JSON.parse(localStorage.getItem(key))
    } catch (e) {console.log(e)}
  }


  store_bool(key, value) {this.store(key, !!value)}


  retrieve_bool(key, timeout = store_timeout) {
    return !!this.retrieve(key, timeout)
  }


  uri_get(str, name, defaultValue) {
    let regex   = new RegExp('((^[\\?#]?)|[&])' + name + '=([^&#]*)')
    let results = regex.exec(str)

    return results === null ?
      (defaultValue === undefined ? '' : defaultValue) :
      decodeURIComponent(results[3].replace(/\+/g, ' '))
  }


  query_get(name, defaultValue) {
    return this.uri_get(location.search, name, defaultValue)
  }


  cookie_get(name) {
    const parts = `; ${document.cookie}`.split(`; ${name}=`)
    if (parts.length == 2) return parts.pop().split(';').shift()
  }


  parse_interval(t) {
    let re = '(?<num>\\d+(\\.\\d+)?) *(?<unit>[a-zA-Z]+) *'
    if (!new RegExp(`^(${re})+$`).test(t)) throw `Invalid time interval "${t}"`
    re = new RegExp(re, 'g')

    let secs = 0
    let match

    while ((match = re.exec(t)) !== null) {
      let num = match.groups.num

      switch (match.groups.unit[0]) {
      case 'y': num *= 365
      case 'd': num *= 24
      case 'h': num *= 60
      case 'm': num *= 60
      case 's': num *= 1; break
      default: throw `Invalid time interval "${t}"`
      }

      secs += num
    }

    return secs
  }


  time_interval(secs) {
    if (!isFinite(secs)) return '???'
    if (secs < 0) return '-' + this.time_interval(-secs)

    function div(x, y) {return (x / y) >> 0}
    function mod(x, y) {return (x % y) >> 0}

    if (secs && secs < 0.9995) return Math.round(secs * 1000) + 'ms'
    if (secs < 60) return Math.round(secs) + 's'
    if (secs < 60 * 60) return div(secs, 60) + 'm ' + zpad(mod(secs, 60)) + 's'
    if (secs < 60 * 60 * 24)
      return div(secs, 60 * 60) + 'h ' + zpad(div(mod(secs, 60 * 60), 60)) + 'm'

    return div(secs, 60 * 60 * 24) + 'd ' +
      zpad(div(mod(secs, 60 * 60 * 24), 60 * 60)) + 'h'
  }


  format_time(t) {
    t = new Date(t)
    return t.getUTCFullYear() + '/' + zpad(t.getUTCMonth() + 1) + '/' +
      zpad(t.getUTCDate())    + ' ' + zpad(t.getUTCHours()) + ':' +
      zpad(t.getUTCMinutes()) + ':' + zpad(t.getUTCSeconds())
  }


  since(t, when = new Date) {
    let secs = (new Date(t).getTime() - new Date(when).getTime()) / 1000
    return this.time_interval(-secs)
  }


  format_timeout(t, offset) {
    t = (new Date(t).getTime() - new Date().getTime()) / 1000 + offset
    return t < 0 ? 'Expired' : this.time_interval(t)
  }


  timeout_time(t, offset) {
    return this.format_time(new Date(t).getTime() + offset * 1000)
  }


  wrap(s, length) {
    if (!length) return s

    let chunks = []

    for (let i = 0; i < Math.ceil(s.length / length); i++)
      chunks.push(s.substr(i * length, length))

    return chunks.join('\n')
  }


  base64_encode(s, length) {return this.wrap(btoa(s), length)}


  urlbase64_encode(s, length) {
    s = this.base64_encode(s, length)
    return s.replace(/[+\/=]/g, c => this._urlbase64_map[c])
  }


  base64_decode(s) {
    return atob(s.replace(/[-_]/g, c => this._base64_map[c]))
  }


  str2buf(str) {return Uint8Array.from(str, c => c.codePointAt(0))}


  buf2str(buf) {
    let view   = new Uint8Array(buf)
    let block  = 65535
    let result = ''

    for (let i = 0; i < view.length; i += block) {
      if (view.length < i + block) block = view.length - i
      result += String.fromCharCode.apply(null, view.subarray(i, i + block))
    }

    return result
  }


  async decompress(s, type) {
    if (type != 'gzip') throw 'Unsupported compression type "' + type + '"'
    return this.buf2str(ungzip(this.str2buf(s)))
  }


  get_direct_address() {
    return localStorage.getItem('fah-direct-address') || undefined
  }


  set_direct_address(addr) {
    if (!addr) localStorage.removeItem('fah-direct-address')
    else localStorage.setItem('fah-direct-address', addr)
  }


  set_body_class(enable, name) {
    document.body.classList[enable ? 'add' : 'remove'](name)
  }
}

export default Util