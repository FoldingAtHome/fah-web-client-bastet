class Sock {
  constructor(url, timeout = 2000) {
    this.url = url
    this.timeout = timeout
    this.connected = false
  }


  destroy() {
    this.connect = () => {}
    if (this.ws) this.ws.close()
  }


  on_message(msg) {console.log('WS:', msg)}
  on_open(event)  {}
  on_close(event) {}
  on_error(event) {}


  _clear_timeout () {
    if (this.timer != undefined) clearTimeout(this.timer)
    this.timer = undefined
  }


  _open(event) {
    this.connected = true
    this._clear_timeout()
    this.on_open(event)
  }


  _close(event) {
    this._clear_timeout()
    this.connected = false
    this.ws = undefined
    this.on_close(event)
    this.connect()
  }


  _message(event) {this.on_message(JSON.parse(event.data))}
  _timeout() {this.ws.close()}


  connect() {
    if (this.ws != undefined) return

    console.debug('Connecting to ' + this.url)

    this.ws = new WebSocket(this.url)

    this.ws.addEventListener('open',    e => this._open(e))
    this.ws.addEventListener('close',   e => this._close(e))
    this.ws.addEventListener('error',   e => this.on_error(e))
    this.ws.addEventListener('message', e => this._message(e))

    this.timer = setTimeout(() => this._timeout(), this.timeout)
  }


  send(msg) {
    if (this.connected) {
      console.debug('Sending:', msg)
      this.ws.send(JSON.stringify(msg))

    } else console.debug('Cannot send message, not connected:', msg)
  }
}


export default Sock
