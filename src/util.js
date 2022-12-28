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
  _peerRE: new RegExp(/^(([\w.-]+)(:\d+)?)?(\/[\w.-]*)?$/),


  parse_peer_address(address = '') {
    let m = address.match(this._peerRE)
    if (!m) return

    return {
      host: m[2],
      port: m[3] ? parseInt(m[3].substring(1)) : undefined,
      path: m[4]
    }
  },


  make_peer_address(address, parent) {
    let peer = this.parse_peer_address(address)
    let rel  = this.parse_peer_address(parent)

    let host = peer.host || rel.host || ''
    let port = peer.port || rel.port
    let path = peer.path || ''

    return host + (port ? ':' + port : '') + path
  },


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

    if (Array.isArray(data) && key === -1) data.push(value)
    else if (value === null) {
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


  ansi2html(s) {
    let m = s.match(/^\u001b\[(\d+)m(.*)\u001b\[0m$/)
    if (!m) return s

    let c = parseInt(m[1])
    let fg = true

    if (30 <= c && c <= 37) c = colors[c - 30]
    else if (40 <= c && c <= 47) {c = colors[c - 40]; fg = false}
    else if (90 <= c && c <= 97) c = bright[c - 90]
    else if (100 <= c && c <= 107) {c = colors[c - 100]; fg = false}
    else return m[2]

    let style = (fg ? 'color' : 'background') + ':' + c

    return '<font style="' + style + '">' + m[2] + '</font>'
  },


  store(key, value, timeout = store_timeout) {
    localStorage.setItem(key, JSON.stringify(value))
    localStorage.setItem(key + '.__ts__', new Date().toISOString())
  },


  retrieve(key, timeout = store_timeout) {
    let ts = localStorage.getItem(key + '__ts__')

    try {
      if (timeout < Date.now() - new Date(ts).getTime())
        return JSON.parse(localStorage.getItem(key))
    } catch (e) {
      console.log(e)
    }
  },
}
