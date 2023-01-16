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

    try {
      this.ws = new WebSocket(this.url)

      this.ws.addEventListener('open',    e => this._open(e))
      this.ws.addEventListener('close',   e => this._close(e))
      this.ws.addEventListener('error',   e => this.on_error(e))
      this.ws.addEventListener('message', e => this._message(e))

      this.timer = setTimeout(() => this._timeout(), this.timeout)
    } catch (e) {console.error('Connection failed', e)}
  }


  send(msg) {
    if (this.connected) {
      console.debug('Sending:', msg)
      this.ws.send(JSON.stringify(msg))

    } else console.debug('Cannot send message, not connected:', msg)
  }
}


export default Sock
