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

class Sock {
  constructor(url, timeout = 20000) {
    this.url       = url
    this.timeout   = timeout
    this.connected = false
  }


  set_url(url) {this.url = url}
  set_timeout(timeout) {this.timeout = timeout}


  on_message(msg) {console.log('WS:', msg)}
  on_open(event)  {}
  on_close(event) {}
  on_error(event) {}


  _clear_timeout() {clearTimeout(this.timer)}


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
  }


  _error(event) {this.on_error(event)}
  _message(event) {this.on_message(JSON.parse(event.data))}
  _timeout() {this.close()}


  close() {
    if (this.ws) this.ws.close()
    this._clear_timeout()
  }


  connect() {
    if (this.ws != undefined) return

    console.debug('Connecting to ' + this.url)

    this.ws = new WebSocket(this.url)

    this.ws.onopen    = e => this._open(e)
    this.ws.onclose   = e => this._close(e)
    this.ws.onerror   = e => this._error(e)
    this.ws.onmessage = e => this._message(e)

    this.timer = setTimeout(() => this._timeout(), this.timeout)
  }


  send(msg) {
    if (this.connected) this.ws.send(JSON.stringify(msg))
    else console.debug('Cannot send message, not connected:', msg)
  }
}


export default Sock
