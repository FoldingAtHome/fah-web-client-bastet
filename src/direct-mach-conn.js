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

import util           from './util.js'
import MachConnection from './mach-connection.js'
import Sock           from './sock.js'


class DirectMachConn extends MachConnection {
  constructor(ctx, name, address) {
    let mach = ctx.$machs.create('local')
    super(mach)

    this.ctx = ctx
    this.initialized = false
    mach.set_conn(this)

    let url  = 'ws://' + address + '/api/websocket'
    this.sock = new Sock(url)
    this.sock.on_open    = ()    => this._on_open()
    this.sock.on_close   = event => this._on_close(event)
    this.sock.on_message = msg   => this._on_message(msg)

    this.open()
  }


  destroy() {if (this.sock) this.sock.destroy()}
  open() {this.sock.connect()}


  // From MachConnection
  is_connected()  {return this.sock.connected}
  is_direct()     {return true}
  async send(msg) {return this.sock.send(msg)}
  close()         {this.sock.close()}


  _clear_ping() {
    if (this._ping_timer != undefined) clearTimeout(this._ping_timer)
    delete this._ping_timer
  }


  _update_ping() {
    if (util.version_less('8.1.17', this.mach.get_version())) {
      this._clear_ping()
      this._ping_timer = setTimeout(() => {
        console.log(this.mach.get_name() + ': timedout')
        this.sock.close()
      }, 30000)
    }
  }


  _on_open(event) {this.on_open()}


  _on_close(event) {
    this._clear_ping()
    this.on_close()
    setTimeout(() => this.sock.connect(), 1000)
  }


  _on_message(msg) {
    this._update_ping()
    this.on_message(msg)

    if (!this.initialized) {
      let info = this.mach.get_info()

      if (info.version) {
        this.initialized = true

        // Prefer direct connection
        if (info.id) {
          this.mach.id = info.id
          this.ctx.$machs.set(info.id, this.mach)
        }

        // Update machine name
        if (info.mach_name) this.mach.set_name(info.mach_name)

        // Auto link local machine if not already linked to an account
        let token = this.ctx.$account.data.token
        if (token && !info.account) this.mach.link(token)
      }
    }
  }
}


export default DirectMachConn
