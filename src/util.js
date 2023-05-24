/******************************************************************************\

                  This file is part of the Folding@home Client.

          The fah-client runs Folding@home protein folding simulations.
                    Copyright (c) 2001-2023, foldingathome.org
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


export default {
  download_url: 'https://foldingathome.org/beta/',
  _addressRE: new RegExp(/^(([\w.-]+)(:\d+)?)?(\/[\w.-]+)?$/),


  update(data, update) {
    let i = 0

    while (i < update.length - 2) {
      let key = update[i++]

      if (data[key] == undefined) {
        let isList = i == update.length - 1 || Number.isInteger(update[i])
        data[key] = isList ? [] : {}
      }

      data = data[key]
    }

    let key   = update[i++]
    let value = update[i]

    if (Array.isArray(data) && key < 0) {
      if (key === -1) data.push(value)
      else data.splice(data.length, 0, ...value)

    } else if (value === null) {
      if (Array.isArray(data)) data.splice(key, 1)
      else delete data[key]

    } else data[key] = value
  },


  lock_scrolling() {
    document.body.style.position = 'fixed'
    document.body.style.top = `-${window.scrollY}px`
  },


  unlock_scrolling() {
    const scrollY = document.body.style.top
    document.body.style.position = ''
    document.body.style.top = ''
    window.scrollTo(0, parseInt(scrollY || '0') * -1)
  },


  Deferred() {
    const self = this

    this._promise = new Promise((resolve, reject) => {
      self.resolve = resolve
      self.reject = reject
    })

    this.promise = () => self._promise
  },


  isObject(o) {return o != null && typeof o === 'object'},


  deepCopy(o) {
    if (Array.isArray(o)) {
      let l = []

      for (const value of o)
        l.push(this.deepCopy(value))

      return l
    }

    if (this.isObject(o)) {
      let r = {}

      for (const key of Object.keys(o))
        r[key] = this.deepCopy(o[key])

      return r
    }

    return o
  },


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
  },


  format(s, o) {
    return s.replace(
      /{([^{}]*)}/g,
      (a, b) => {
        const r = o[b]
        return typeof r === 'string' || typeof r === 'number' ? r : a
      }
    )
  },


  human_number(x, precision = 1) {
    if (1e12 <= x) return (x / 1e12).toFixed(precision) + 'T'
    if (1e9  <= x) return (x / 1e9 ).toFixed(precision) + 'B'
    if (1e6  <= x) return (x / 1e6 ).toFixed(precision) + 'M'
    if (1e3  <= x) return (x / 1e3 ).toFixed(precision) + 'K'
    return x
  },


  capitalize(s) {return s ? s.charAt(0).toUpperCase() + s.slice(1) : ''},


  escapehtml(s) {
    return s.replace(/[&<>"']/g, c => {
      switch (c) {
      case '&': return '&amp;'
      case '<': return '&lt;'
      case '>': return '&gt;'
      case '"': return '&quot;'
      case "'": return '&#039;'
      }
    })
  },


  ansi2html(s) {
    return this.escapehtml(s).replace(
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
  },


  version_parse(v) {
    if (typeof(v) == 'string') v = v.split('.')
    if (v != undefined && v.length == 3) return v.map(x => parseInt(x))
    return [0, 0, 0]
  },


  version_less(a, b) {return this.version_parse(a) < this.version_parse(b)},


  remove(key) {
    localStorage.removeItem(key)
    localStorage.removeItem(key + '.__ts__')
  },


  store(key, value) {
    localStorage.setItem(key, JSON.stringify(value))
    localStorage.setItem(key + '.__ts__', new Date().toISOString())
  },


  is_expired(key, timeout = store_timeout) {
    if (!timeout) return false
    let ts = localStorage.getItem(key + '.__ts__')

    try {
      if (Date.now() - new Date(ts).getTime() < timeout) return false
    } catch (e) {}

    return true
  },


  retrieve(key, timeout = store_timeout) {
    try {
      if (!this.is_expired(key, timeout))
        return JSON.parse(localStorage.getItem(key))
    } catch (e) {console.log(e)}
  },


  store_bool(key, value) {this.store(key, !!value)},


  retrieve_bool(key, timeout = store_timeout) {
    return !!this.retrieve(key, timeout)
  },


  uri_get(str, name, defaultValue) {
    let regex   = new RegExp('((^[\\?#]?)|[&])' + name + '=([^&#]*)')
    let results = regex.exec(str)

    return results === null ?
      (defaultValue === undefined ? '' : defaultValue) :
      decodeURIComponent(results[3].replace(/\+/g, ' '))
  },


  query_get(name, defaultValue) {
    return this.uri_get(location.search, name, defaultValue)
  },


  cookie_get(name) {
    const parts = `; ${document.cookie}`.split(`; ${name}=`)
    if (parts.length == 2) return parts.pop().split(';').shift()
  },


  time_interval(secs) {
    function div(x, y) {return (x / y) >> 0}
    function mod(x, y) {return (x % y) >> 0}

    if (secs < 60) return parseInt(secs) + 's'
    if (secs < 60 * 60) return div(secs, 60) + 'm ' + mod(secs, 60) + 's'
    if (secs < 60 * 60 * 24)
      return div(secs, 60 * 60) + 'h ' + mod(secs, 60 * 60) + 'm'

    return div(secs, 60 * 60 * 24) + 'd ' + mod(secs, 60 * 60 * 24) + 'h'
  },


  wrap(s, length) {
    if (!length) return s

    let chunks = []

    for (let i = 0; i < Math.ceil(s.length / length); i++)
      chunks.push(s.substr(i * length, length))

    return chunks.join('\n')
  },


  _urlbase64_map: {'+': '-', '\/': '_', '=': ''},
  _base64_map:    {'-': '+', '_': '\/'},


  base64_encode(s, length) {return this.wrap(btoa(s), length)},


  urlbase64_encode(s, length) {
    s = this.base64_encode(s, length)
    return s.replace(/[+\/=]/g, c => this._urlbase64_map[c])
  },


  base64_decode(s) {
    return atob(s.replace(/[-_]/g, c => this._base64_map[c]))
  },


  str2buf(str) {return Uint8Array.from(str, c => c.codePointAt(0))},


  buf2str(buf) {
    let view   = new Uint8Array(buf)
    let block  = 65535
    let result = ''

    for (let i = 0; i < view.length; i += block) {
      if (view.length < i + block) block = view.length - i
      result += String.fromCharCode.apply(null, view.subarray(i, i + block))
    }

    return result
  },


  async decompress(s, type) {
    if (type != 'gzip') throw 'Unsupported compression type "' + type + '"'
    return this.buf2str(ungzip(this.str2buf(s)))
  },
}
