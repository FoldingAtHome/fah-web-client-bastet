/******************************************************************************\

                  Copyright 2018-2023. Cauldron Development LLC
                              All Rights Reserved.

                  For information regarding this software email:
                                 Joseph Coffland
                          joseph@cauldrondevelopment.com

        This software is free software: you can redistribute it and/or
        modify it under the terms of the GNU Lesser General Public License
        as published by the Free Software Foundation, either version 2.1 of
        the License, or (at your option) any later version.

        This software is distributed in the hope that it will be useful,
        but WITHOUT ANY WARRANTY; without even the implied warranty of
        MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
        Lesser General Public License for more details.

        You should have received a copy of the GNU Lesser General Public
        License along with the C! library.  If not, see
        <http://www.gnu.org/licenses/>.

\******************************************************************************/

import util           from './util.js'
import crypto         from './crypto.js'
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

    let iv = crypto.get_random(16)

    let payload = JSON.stringify(msg)
    payload = await crypto.aes(this.key, iv, payload, true)
    payload = util.urlbase64_encode(payload)

    iv = util.urlbase64_encode(iv)
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
    iv = util.base64_decode(iv)

    let payload = util.base64_decode(msg.payload)
    payload = await crypto.aes(this.key, iv, payload, false)

    // Decompress
    if (msg.compression)
      payload = await util.decompress(payload, msg.compression)

    payload = JSON.parse(payload)

    if (payload.session != this.ctx.$node.sid)
      throw 'Message not for this session'

    // TODO find correct machine instance for payload.group

    // Process message content
    this.on_message(payload.content)
  }
}


export default NodeMachConn
