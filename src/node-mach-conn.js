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


class NodeMachConn extends MachConnection {
  constructor(ctx, mach, key) {
    super(mach)
    this.ctx  = ctx
    this.key  = key
    this.ivs  = {}
  }


  async open() {
    await this._send({
      type:   'session-open',
      session: this.ctx.$node.sid,
    })

    this.on_open()
  }


  close() {this.on_close()}


  // From MachConnection
  is_connected() {return true}


  async send(msg) {
    return this._send({
      type:    'message',
      session: this.ctx.$node.sid,
      content: msg,
    })
  }


  async _send(msg) {
    console.debug('Sending:', msg)

    let iv = this.ctx.$crypto.get_random(16)

    let payload = JSON.stringify(msg)
    payload = await this.ctx.$crypto.aes(this.key, iv, payload, true)
    payload = this.ctx.$util.urlbase64_encode(payload)

    iv = this.ctx.$util.urlbase64_encode(iv)
    this.ivs[iv] = true

    msg = {type: 'message', id: this.get_id(), iv, payload}
    return this.ctx.$node.send(msg)
  }


  async receive(msg) {
    // Check that this is a new IV.  Also prevents replay attacks.
    let iv = msg.iv
    if (this.ivs[iv]) throw 'IV cannot be used more than once'
    if (1e6 < this.ivs.length) throw 'Too many IVs'
    this.ivs[iv] = true
    iv = this.ctx.$util.base64_decode(iv)

    let payload = this.ctx.$util.base64_decode(msg.payload)
    payload = await this.ctx.$crypto.aes(this.key, iv, payload, false)

    // Decompress
    if (msg.compression)
      payload = await this.ctx.$util.decompress(payload, msg.compression)

    payload = JSON.parse(payload)

    if (payload.session != this.ctx.$node.sid)
      throw 'Message not for this session'

    // TODO find correct machine instance for payload.group

    // Process message content
    this.on_message(payload.content)
  }
}


export default NodeMachConn
