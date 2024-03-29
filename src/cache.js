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

class Cache {
  constructor(name, timeout) {
    this.name    = name
    this.timeout = timeout
  }


  async set(key, value, status) {
    let data = {ts: new Date().toISOString(), value, status}

    try {
      if (!this.cache) this.cache = await caches.open(this.name)
      await this.cache.put(key, new Response(JSON.stringify(data)))

    } catch (e) {
      if (!this._cache) this._cache = {}
      this._cache[key] = data
    }
  }


  async get(key, timeout, withStatus = false) {
    let data
    if (timeout == undefined) timeout = this.timeout

    try {
      if (!this.cache) this.cache = await caches.open(this.name)

      let res = await this.cache.match(key)
      if (!res) return
      data = await res.json()

    } catch (e) {
      if (!this._cache) this._cache = {}
      data = this._cache[key]
    }

    if (data &&
        (!timeout || Date.now() - new Date(data.ts).getTime() < timeout))
      return withStatus ? data : data.value
  }
}


export default Cache
