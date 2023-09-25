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

import Sock         from './sock.js'
import util         from './util.js'
import crypto       from './crypto.js'
import NodeMachConn from './node-mach-conn.js'



class Node extends Sock {
  constructor(ctx, ...args) {
    super(undefined, ...args)
    this.ctx = ctx
    this.active = false
  }


  async _mach_add(msg) {
    // Load mach public key
    let pubkey = await crypto.spki_import(util.base64_decode(msg.pubkey))

    // Compute mach ID from public key
    let id = await crypto.pubkey_id(pubkey)

    // Verify signature
    let signature = util.base64_decode(msg.signature)
    let data      = JSON.stringify(msg.payload)
    let result    = await crypto.rsa_verify(pubkey, signature, data)
    if (!result) throw 'Invalid machine signature'

    // Check that message is for this account
    if (msg.payload.account != this.id)
      throw ('Machine login ' + msg.payload.account +
             ' is not for this account ' + this.id)

    // Decrypt cipher key
    let key = util.base64_decode(msg.payload.key)
    key = await crypto.rsa_decrypt(this.deckey, key)
    key = await crypto.aes_import(key)

    let mach = this.ctx.$machs.get(id)

    // Update our machines list
    if (!mach) {
      await this.ctx.$account.update()
      mach = this.ctx.$machs.get(id)
    }

    if (mach && !mach.is_direct()) {
      console.log('Adding node machine connection', id)
      let conn = new NodeMachConn(this.ctx, mach, key)
      mach.set_conn(conn)
      await conn.open()

    } else console.debug('Ignoring new node client connection', id)
  }


  async _mach_del(id) {
    let mach = this.ctx.$machs.get(id)
    if (!mach || mach.is_direct()) return

    console.log('Closing node machine connection', id)

    mach.close()
    mach.set_conn()
  }


  async _mach_msg(msg) {
    let mach = this.ctx.$machs.get(msg.client)
    if (mach) return mach.get_conn().receive(msg)
  }


  on_message(msg) {
    switch (msg.type) {
    case 'connect':    return this._mach_add(msg.client)
    case 'disconnect': return this._mach_del(msg.id)
    case 'message':    return this._mach_msg(msg)
    case 'broadcast':  break // Ignore for now
    default: throw 'Unsupported account message type "' + msg.type + '"'
    }
  }


  on_open(event)  {this._login()}


  on_close(event) {
    console.log('Account closed')

    for (let mach of this.ctx.$machs)
      if (!mach.is_direct())
        mach.close()

    // Work around for Brave.  Loading the node's root page lets it connect.
    fetch('https://' + this.ctx.$adata.node, {mode: 'no-cors'})

    if (this.active) setTimeout(() => this.connect(), 1000)
  }


  on_error(event) {console.debug('WS error', event)}


  async _login() {
    // Compute account ID
    let apub = util.base64_decode(this.ctx.$adata.pubkey)
    apub     = await crypto.spki_import(apub)
    this.id  = await crypto.pubkey_id(apub)

    // Send login message
    this.sid    = util.urlbase64_encode(crypto.get_random(12))
    let payload = {time: new Date().toISOString(), session: this.sid}
    let signature = await crypto.rsa_sign(this.sigkey, JSON.stringify(payload))

    let msg = {
      type: 'login',
      payload,
      pubkey: this.ctx.$adata.pubkey,
      signature: util.urlbase64_encode(signature),
    }

    this.send(msg)
  }


  async login() {
    if (!this.ctx.$adata.node) return
    this.active = true

    // Import private key for decryption and signing
    let secret = this.ctx.$account.secret
    this.deckey = await crypto.pkcs8_import(secret, 'RSA-OAEP')
    this.sigkey = await crypto.pkcs8_import(secret, 'RSASSA-PKCS1-v1_5')

    this.set_url('wss://' + this.ctx.$adata.node + '/ws/account')
    this.connect()
  }


  async logout() {
    this.active = false
    return this.close()
  }


  async broadcast(cmd, data = {}) {
    if (!this.connected) throw 'Account not connected'

    let payload   = Object.assign({cmd, time: new Date().toISOString()}, data)
    let signature = await crypto.rsa_sign(this.sigkey, JSON.stringify(payload))
    signature     = util.urlbase64_encode(signature)

    console.debug('Broadcasting:', payload)
    this.send({type: 'broadcast', payload, signature})
  }
}


export default Node
