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

import Sock         from './sock.js'
import NodeMachConn from './node-mach-conn.js'
import {reactive, watchEffect} from 'vue'



class Node extends Sock {
  constructor(ctx, ...args) {
    super(undefined, ...args)
    this.ctx    = ctx
    this.util   = ctx.$util
    this.crypto = ctx.$crypto
    this.state  = reactive({})

    watchEffect(() => this.login())
  }


  is_loading() {return this.state.loading}


  async _mach_add(msg) {
    // Load mach public key
    let pubkey =
      await this.crypto.spki_import(this.util.base64_decode(msg.pubkey))

    // Compute mach ID from public key
    let id = await this.crypto.pubkey_id(pubkey)

    // Verify signature
    let signature = this.util.base64_decode(msg.signature)
    let data      = JSON.stringify(msg.payload)
    let result    = await this.crypto.rsa_verify(pubkey, signature, data)
    if (!result) throw 'Invalid machine signature'

    // Check that message is for this account
    if (msg.payload.account != this.id)
      throw ('Machine login ' + msg.payload.account +
             ' is not for this account ' + this.id)

    // Decrypt cipher key
    let key = this.util.base64_decode(msg.payload.key)
    key = await this.crypto.rsa_decrypt(this.deckey, key)
    key = await this.crypto.aes_import(key)

    let mach = this.ctx.$machs.get(id)

    // Update our machines list
    if (!mach) {
      await this.ctx.$account.update()
      mach = this.ctx.$machs.get(id, false)
    }

    if (mach) {
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
    if (mach && mach.get_conn()) mach.get_conn().receive(msg)
  }


  async on_broadcast(msg) {
    // Check signature
    let apub      = this.ctx.$adata.pubkey
    let pubkey    = await this.crypto.spki_import(this.util.base64_decode(apub))
    let signature = this.util.base64_decode(msg.signature)
    await this.crypto.rsa_verify(pubkey, signature, JSON.stringify(msg.payload))

    console.debug('broadcast:', msg.payload)

    // Handle command
    let cmd = msg.payload.cmd
    if (cmd == 'restart' || cmd == 'config') {
      let ts = new Date(msg.payload.time).getTime()
      await this.ctx.$account.update(ts)
    }
  }


  on_message(msg) {
    switch (msg.type) {
    case 'connect':    return this._mach_add(msg.client)
    case 'disconnect': return this._mach_del(msg.id)
    case 'message':    return this._mach_msg(msg)
    case 'broadcast':  return this.on_broadcast(msg)
    default: throw 'Unsupported account message type "' + msg.type + '"'
    }
  }


  on_open(event) {this._login()}


  on_close(event) {
    if (!this.state.active) return

    console.log('Account closed')

    for (let mach of this.ctx.$machs)
      if (!mach.is_direct())
        mach.close()

    // Work around for Brave.  Loading the node's root page lets it connect.
    fetch('https://' + this.ctx.$adata.node, {mode: 'no-cors'})

    if (this.state.active) setTimeout(() => this.connect(), 1000)
  }


  on_error(event) {console.debug('WS error', event)}


  async _login() {
    setTimeout(() => this.state.loading = false, 8000)

    // Compute account ID
    let apub = this.util.base64_decode(this.ctx.$adata.pubkey)
    apub     = await this.crypto.spki_import(apub)
    this.id  = await this.crypto.pubkey_id(apub)

    // Send login message
    this.sid    = this.util.urlbase64_encode(this.crypto.get_random(12))
    let payload = {time: new Date().toISOString(), session: this.sid}
    let signature =
      await this.crypto.rsa_sign(this.sigkey, JSON.stringify(payload))

    let msg = {
      type: 'login',
      payload,
      pubkey: this.ctx.$adata.pubkey,
      signature: this.util.urlbase64_encode(signature),
    }

    this.send(msg)
  }


  async login() {
    if (this.state.active) await this.logout()
    if (!this.ctx.$adata.node) return

    this.state.active  = true
    this.state.loading = true

    // Import private key for decryption and signing
    let secret  = this.ctx.$account.secret
    this.deckey = await this.crypto.pkcs8_import(secret, 'RSA-OAEP')
    this.sigkey = await this.crypto.pkcs8_import(secret, 'RSASSA-PKCS1-v1_5')

    this.set_url('wss://' + this.ctx.$adata.node + '/ws/account')
    this.connect()
  }


  async logout() {
    this.state.active = false

    let machs = Array.from(this.ctx.$machs)
    for (let mach of machs)
      if (!mach.is_direct()) {
        mach.close()
        this.ctx.$machs.del(mach.get_id())
      }

    await this.close()
  }


  async broadcast(cmd, data = {}) {
    if (!this.state.active) return

    let payload   = Object.assign({cmd, time: new Date().toISOString()}, data)
    let signature =
      await this.crypto.rsa_sign(this.sigkey, JSON.stringify(payload))
    signature     = this.util.urlbase64_encode(signature)

    console.debug('Broadcasting:', payload)
    this.send({type: 'broadcast', payload, signature})
  }
}


export default Node
