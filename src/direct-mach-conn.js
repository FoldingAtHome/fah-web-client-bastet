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

import MachConnection from './mach-connection.js'
import Sock           from './sock.js'


class DirectMachConn extends MachConnection {
  constructor(ctx, name, address = '127.0.0.1:7396') {
    super(ctx.$machs.create(undefined))

    this.ctx = ctx
    this.initialized = false

    this.mach.set_conn(this)
    this.set_address(address)
    this.ctx.$machs.set('__direct__', this.mach)
  }


  set_address(address) {
    if (this.address == address) return
    this.address = address

    if (this.sock) {
      this.sock.on_open    = () => {}
      this.sock.on_close   = () => {}
      this.sock.on_message = () => {}
      this.sock.close()
      delete this.sock
      this._on_close()
    }

    this.mach.set_name('direct')
    this.mach.state.data = {}

    let url  = 'ws://' + address + '/api/websocket'
    this.sock = new Sock(url)
    this.sock.on_open    = ()    => this._on_open()
    this.sock.on_close   = event => this._on_close(event)
    this.sock.on_message = msg   => this._on_message(msg)

    this.open()
  }


  open() {this.sock.connect()}


  // From MachConnection
  is_connected()  {return this.sock.connected}
  is_direct()     {return true}
  async send(msg) {return this.sock.send(msg)}


  _clear_ping() {
    if (this._ping_timer != undefined) clearTimeout(this._ping_timer)
    delete this._ping_timer
  }


  _update_ping() {
    if (this.ctx.$util.version_less('8.1.17', this.mach.get_version())) {
      this._clear_ping()
      this._ping_timer = setTimeout(() => {
        console.log(this.mach.get_name() + ': timed out')
        this.sock.close()
      }, 30000)
    }
  }


  _on_open(event) {this.on_open()}


  _on_close(event) {
    this._clear_ping()
    this.on_close()
    this.initialized = false
    if (this.sock) setTimeout(() => this.sock.connect(), 1000)
  }


  _on_message(msg) {
    this._update_ping()
    this.on_message(msg)

    if (!this.initialized) {
      let info = this.mach.get_info()

      if (info.version) {
        this.initialized = true

        // Check versions, reload Web Control if out of date
        console.debug('Direct Client Version', info.version)
        let last_version = this.ctx.$util.retrieve('fah-last-version')
        let our_version  = import.meta.env.PACKAGE_VERSION

        if (this.ctx.$util.version_less(our_version, info.version) &&
            (!last_version ||
              this.ctx.$util.version_less(last_version, info.version))) {
          this.ctx.$util.store('fah-last-version', info.version)

          if (location.hostname.indexOf('foldingathome.org') != -1) {
            if (!info.url) location.reload(true)
            else location.replace(info.url)
          }
        }

        // Set direct connection
        if (info.id) {
          let node_mach = this.ctx.$machs.get(info.id)
          if (node_mach) this.mach.dup_state(node_mach)
          this.mach.state.id = info.id
        }

        // Update machine name
        if (info.mach_name) this.mach.set_name(info.mach_name)

        this.mach.auto_link()
      }
    }
  }
}


export default DirectMachConn
