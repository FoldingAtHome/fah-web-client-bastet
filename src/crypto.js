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

import bip39 from './bip39.js'


class Crypto {
  constructor(ctx) {
    this.util = ctx.$util
    this.subtle = crypto.subtle
  }


  get_random(bytes) {
    let rand = new Uint8Array(bytes)
    crypto.getRandomValues(rand)
    return this.util.buf2str(rand)
  }


  gen_passphrase() {
    let rand = new Uint16Array(4)
    crypto.getRandomValues(rand)

    let words = []
    for (let x of rand)
      words.push(bip39[x & 2047])

    return words.join(' ')
  }


  async export(type, key) {
    let data = await this.subtle.exportKey(type, key)
    return type == 'jwk' ? data : this.util.buf2str(data)
  }


  async import(type, data, config, usage, allowExport = true) {
    return this.subtle.importKey(
      type, this.util.str2buf(data), config, allowExport, usage)
  }


  async crypt(config, key, data, encrypt) {
    return this.util.buf2str(
      await this.subtle[encrypt ? 'encrypt' : 'decrypt'](
        config, key, this.util.str2buf(data)))
  }


  async derive(config, material, keyConfig, usage) {
    return this.subtle.deriveKey(config, material, keyConfig, true, usage)
  }


  async wrap(type, unwrapped, key, config) {
    return this.util.buf2str(
      await this.subtle.wrapKey(type, unwrapped, key, config))
  }


  async unwrap(type, wrapped, key, config, unwrappedConfig, usage) {
    return this.subtle.unwrapKey(
      type, this.util.str2buf(wrapped), key, config, unwrappedConfig, true,
      usage)
  }


  async digest(algorithm, data) {
    let config = {name: algorithm}
    return this.util.buf2str(
      await this.subtle.digest(config, this.util.str2buf(data)))
  }


  async generate(config, usage) {
    return this.subtle.generateKey(config, true, usage)
  }


  async sign(algorithm, key, data) {
    return this.util.buf2str(
      await this.subtle.sign(algorithm, key, this.util.str2buf(data)))
  }


  async verify(algorithm, key, signature, data) {
    return this.subtle.verify(
      algorithm, key, this.util.str2buf(signature), this.util.str2buf(data))
  }


  async sha256(data) {return this.digest('SHA-256', data)}


  async sha256base64(data) {
    return this.util.urlbase64_encode(this.sha256(data))
  }


  async rsa_gen(algorithm = 'RSA-OAEP') {
    let config = {
      name: algorithm,
      modulusLength: 4096,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: {name: 'SHA-256'}
    }

    return this.generate(config, ['encrypt', 'decrypt'])
  }


  async rsa_sign(key, data) {return this.sign('RSASSA-PKCS1-v1_5', key, data)}


  async rsa_verify(key, signature, data) {
    return this.verify('RSASSA-PKCS1-v1_5', key, signature, data)
  }


  async rsa_decrypt(key, data) {
    return this.crypt({name: 'RSA-OAEP'}, key, data, false)
  }


   async pubkey_id(key) {
    let jwk  = await this.export('jwk', key)
    let hash = await this.sha256(this.util.base64_decode(jwk.n))
    return this.util.urlbase64_encode(hash)
  }


  async spki_export(key) {return this.export('spki', key)}


  async spki_import(data, algorithm = 'RSASSA-PKCS1-v1_5') {
    let config = {name: algorithm, hash: 'SHA-256'}

    let usage
    switch (config.name) {
    case 'RSASSA-PKCS1-v1_5': usage = 'verify';  break
    case 'RSA-OAEP':          usage = 'encrypt'; break
    }

    return this.import('spki', data, config, [usage])
  }


  async pkcs8_export(key) {return this.export('pkcs8', key)}


  async pkcs8_import(data, algorithm = 'RSASSA-PKCS1-v1_5') {
    let config = {name: algorithm, hash: 'SHA-256'}

    let usage
    switch (config.name) {
    case 'RSASSA-PKCS1-v1_5': usage = 'sign';    break
    case 'RSA-OAEP':          usage = 'decrypt'; break
    }

    return this.import('pkcs8', data, config, [usage])
  }


  async aes_import(key) {
    return this.import('raw', key, {name: 'AES-CBC'}, ['encrypt', 'decrypt'])
  }


  async aes(key, iv, data, encrypt) {
    let config = {name: 'AES-CBC', iv: this.util.str2buf(iv)}
    return this.crypt(config, key, data, encrypt)
  }


  async pbkdf2_derive(passphrase, salt) {
    let material = await this.import(
      'raw', passphrase, {name: 'PBKDF2'}, ['deriveKey'], false)

    let config = {
      name: 'PBKDF2',
      hash: 'SHA-256',
      salt: this.util.str2buf(salt),
      iterations: 100000
    }
    let keyConfig = {name: 'AES-CBC', length: 256}
    let usage = ['encrypt', 'decrypt', 'wrapKey', 'unwrapKey']

    return this.derive(config, material, keyConfig, usage)
  }


  async pkcs8_wrap(key, unwrapped, iv) {
    iv = this.util.str2buf(iv).slice(0, 16)
    return this.wrap('pkcs8', unwrapped, key, {name: 'AES-CBC', iv})
  }


  async pkcs8_unwrap(key, wrapped, iv) {
    iv = this.util.str2buf(iv).slice(0, 16)

    return this.unwrap(
      'pkcs8', wrapped, key, {name: 'AES-CBC', iv},
      {name: 'RSA-OAEP', hash: 'SHA-256'}, ['decrypt'])
  }


  async raw_export(key) {return this.export('raw', key)}
}


export default Crypto