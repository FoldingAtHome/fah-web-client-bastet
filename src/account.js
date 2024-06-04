/******************************************************************************\

                  This file is part of the Folding@home Client.

          The fah-client runs Folding@home protein folding simulations.
                    Copyright (c) 2001-2024, foldingathome.org
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

import {reactive} from 'vue'
import api        from './api.js'
import util       from './util.js'
import crypto     from './crypto.js'


function get_redirect() {return location.href.replace(/\/?#.*$/, '')}


class Account {
  constructor(ctx) {
    this.ctx      = ctx
    this.provider = util.retrieve('fah-provider', 0)
    this.data     = reactive({})

    this._secret_load()
  }


  get_data() {return this.data}


  set_data(data) {
    for (const key of Object.keys(data))
      this.data[key] = data[key]
  }


  async _secret_load() {
    let secret = util.retrieve('fah-secret', 0)

    if (secret) {
      this.secret = util.base64_decode(secret)
      this.data.unlocked = true
    }
  }


  async _secret_save(prikey) {
    this.secret = await crypto.pkcs8_export(prikey)
    util.store('fah-secret', util.base64_encode(this.secret))
    this.data.unlocked = true
  }


  _secret_clear() {
    util.remove('fah-secret')
    delete this.secret
    this.data.unlocked = false
  }


  async save_credentials(id, password, name, iconURL) {
    let data = {id, password, name, iconURL}
    if (window.PasswordCredential)
      return navigator.credentials.store(new PasswordCredential(data))
  }


  async register(config) {
    const {user, team, passkey, avatar, node, email, passphrase} = config
    const salt = email.toLowerCase()

    const {pubkey, password, secret, key} =
          await this.create_secret(passphrase, salt)

    const verify_url = location.origin + '/verify/'
    const data = {
      user, team, passkey, avatar, node, email, password, pubkey, secret,
      verify_url}

    await this.ctx.$api.put('/register', data)
    return this.save_credentials(email, passphrase, user, avatar)
  }


  async request_reset(config) {
    const data = {email: config.email, url: location.origin + '/reset/'}
    return this.ctx.$api.put('/reset', data, 'Requesting account reset')
  }


  async reset(config) {
    const {token, email, passphrase} = config
    const salt = email.toLowerCase()
    const {pubkey, password, secret, key} =
          await this.create_secret(passphrase, salt)

    return this.ctx.$api.put('/reset/' + token, {pubkey, password, secret},
                        'Resetting account')
  }


  async login_with_passphrase(config) {
    const {email, passphrase} = config
    const salt = await crypto.sha256(email.toLowerCase())
    const {hash, key} = await this.derive_password(passphrase, salt)

    config = {email, password: hash}
    let data = await this.ctx.$api.get('/login', config, 'Signing in')
    this.ctx.$api.sid_save(data.id)
    await this.save_credentials(email, passphrase)
    await this.retrieve_secret(hash, key, salt)
    await this.update()
  }


  async login(provider) {
    this.ctx.$api.sid_clear()
    if (provider) util.store('fah-provider', provider)

    try {
      let config = {redirect_uri: get_redirect()}
      let data = await this.ctx.$api.get('/login/' + provider, config)
      this.ctx.$api.sid_save(data.id)
      await this.save_credentials(email, passphrase)
      location.href = data.redirect

    } catch(e) {console.log('api.login() failed')}
  }


  async derive_password(passphrase, salt) {
    let L = await crypto.pbkdf2_derive(passphrase, salt)
    let H = await crypto.sha256(await crypto.raw_export(L))

    return {hash: util.base64_encode(H), key: L}
  }


  async create_secret(passphrase, salt) {
    // Account secret is created from the passphrase as follows:
    //
    //  1. K = RSA-OAEP.new()
    //  2. P = K.public
    //  3. S = SHA256(salt)
    //  4. L = PBKDF2.derive(passphrase, S)
    //  5. W = L.wrap(K.private, S[0:16])
    //  6. H = SHA256(L)
    //  7. H, W & P are sent to the DB.
    //  8. The DB stores password = SHA256(H), secret = W, pubkey = P
    //
    // After unlocking the secret key, account to remote machine communcation
    // proceeds as follows:
    //
    //  1. E = AES_CBC.new()
    //  2. J = RSA-OAEP.import(machine.pubkey)
    //  3. M = J.encrypt(E)
    //  4. N = K.sign(M)
    //  5. Web control sends M and N to machine via the node.
    //  6. Machine checks signature N is valid for M.
    //  7. Machine computes E = RSA-OAEP.import(machine.prikey).decrypt(M)
    //  8. Communication proceeds with messages encrypted with E.

    let K = await crypto.rsa_gen()
    let P = await crypto.spki_export(K.publicKey)
    salt  = await crypto.sha256(salt)
    let {hash, key} = await this.derive_password(passphrase, salt)
    let W = await crypto.pkcs8_wrap(key, K.privateKey, salt)

    W = util.base64_encode(W)
    P = util.base64_encode(P)

    return {pubkey: P, password: hash, secret: W, key: K}
  }


  async new_secret(passphrase, email) {
    const salt = email.toLowerCase()
    const {pubkey, password, secret, key} =
          await this.create_secret(passphrase, salt)

    const data = {pubkey, password, secret}
    await this.ctx.$api.put('/account/secret', data, 'Storing account secret')
    await this._secret_save(key.privateKey)
    await this.update()
  }


  async lock_secret() {this._secret_clear()}


  async retrieve_secret(password, key, iv) {
    //  Request secret from the DB by passing derived password hash.
    //  The DB compares SHA256(password) and returns secret on match.
    let W = await this.ctx.$api.get(
      '/account/secret', {password}, 'Retreiving account secret')

    // Decrypt private key
    W = util.base64_decode(W.secret)
    let prikey = await crypto.pkcs8_unwrap(key, W, iv)
    await this._secret_save(prikey)
  }


  async unlock_secret(passphrase, salt) {
    salt = await crypto.sha256(salt)
    let {hash, key} = await this.derive_password(passphrase, salt)
    this.retrieve_secret(hash, key, salt)
  }


  async update() {
    if (this.ctx.$api.sid)
      try {
        let account = await this.ctx.$api.fetch({
          path: '/account', action: 'Logging in', error_cb:
          (action, error, r) => {
            if (r.status == 401) this.ctx.$api.sid_clear() // Not logged in
          }})

        if (!account.pubkey) this.set_data({})
        else {
          let pubkey = util.base64_decode(account.pubkey)
          pubkey     = await crypto.spki_import(pubkey)
          account.id = await crypto.pubkey_id(pubkey)
          this.set_data(account)
        }
      } catch (e) {console.error('Login failed', e)}

    return this.data
  }


  async try_login() {
    if (util.query_get('state')) {
      await this.ctx.$api.get('/login/' + this.provider + location.search)
      location.search = '' // Redirect
      throw 'Logging in'
    }

    return this.update()
  }


  loggedout() {
    this.ctx.$api.sid_clear()
    this._secret_clear()
    delete this.data.id
    delete this.data.avatar
    delete this.data.email
    delete this.data.created
    this.data.machines = []
  }


  async logout() {
    await this.ctx.$api.put('/logout')
    this.loggedout()
  }


  async check(create_dialog, ok) {
    if (!this.data.user) return

    if (!this.data.created) {
      let account = await create_dialog()

      if (account) {
        account.passkey = account.passkey || undefined

        try {
          await this.ctx.$api.put('/account', account, 'Creating account')
        } catch(e) {}
      }

      this.logout()
    } else if (this.data.unlocked) return ok()
  }


  async delete() {
    await this.ctx.$api.delete('/account', undefined, 'Deleting account')
    this.loggedout()
    await this.ctx.$node.restart()
  }


  async save(config) {
    let restart = config.node != this.data.node
    await this.ctx.$api.put('/account', config, 'Saving account data')
    this.set_data(config)
    await this.ctx.$node.broadcast('config', {config})
    if (restart) await this.ctx.$node.restart()
  }


  async reset_token() {
    await this.ctx.$api.post('/account/token', null, 'Resetting account token')
    await this.update()
  }
}


export default Account
