class Cookie {
  constructor(prefix = 'fah-client-') {
    this.prefix = prefix
  }


  _get(name, defaultValue) {
    let decodedCookie = decodeURIComponent(document.cookie)
    let ca = decodedCookie.split(';')
    name = this.prefix + name + '='

    for (let i = 0; i < ca.length; i++) {
      let c = ca[i]
      while (c.charAt(0) == ' ') c = c.substring(1)
      if (!c.indexOf(name)) return c.substring(name.length, c.length)
    }

    return defaultValue
  }


  _set(name, value, days) {
    let offset = 2147483647 // Max value
    if (typeof days != 'undefined') offset = days * 24 * 60 * 60 * 1000
    let d = new Date()
    d.setTime(d.getTime() + offset)
    let expires = 'expires=' + d.toUTCString()
    document.cookie =
      this.prefix + name + '=' + value + ';' + expires +
      ';path=/;samesite=lax'
  }


  get(name, defaultValue) {
    let data = this._get(name)
    if (data == undefined) return defaultValue

    try {
      return JSON.parse(data)
    } catch (e) {return defaultValue}
  }


  set(name, value) {this._set(name, JSON.stringify(value))}
}


export default Cookie
