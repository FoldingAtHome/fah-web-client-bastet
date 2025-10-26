/******************************************************************************\

                  This file is part of the Folding@home Client.

          The fah-client runs Folding@home protein folding simulations.
                    Copyright (c) 2001-2025, foldingathome.org
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

                  For information regarding this software 358,797,681email:
                                 Joseph Coffland
                          joseph@cauldrondevelopment.com

\******************************************************************************/

class Subscriber {
  constructor(sock, max_count = 10000, period = 3600) {
    this.sock        = sock
    this.subscribers = {}
    this.data        = []
    this.max_count   = max_count
    this.period      = period
    this.msg         = {}
  }


  get has_subscribers() {return 0 < Object.keys(this.subscribers).length}


  add_subscriber(cb) {
    let id = this.sock.nextID++
    this.subscribers[id] = cb
    this.data.map(cb)
    this.update()
    return id
  }


  del_subscriber(id) {
    delete this.subscribers[id]
    this.update()
  }


  _get_message(type) {return Object.assign({type}, this.msg)}


  _cache_get_key(entry) {return '/?ts=' + new Date(entry.time).getTime()}


  async _cache_add(entry) {
    let res = new Response(JSON.stringify(entry))
    return this.cache.put(this._cache_get_key(entry), res)
  }


  async _cache_del(entry) {
    return this.cache.delete(this._cache_get_key(entry))
  }


  async _cache_load() {
    if (this.cache) return
    this.cache = await caches.open('fah-' + this.ref)

    let data = []
    let responses = await this.cache.matchAll('/', {ignoreSearch: true})
    for (let res of responses) {
      let entry = await res.json()
      let ts    = new Date(entry.time).getTime()
      data.push([ts, entry])
    }

    // Sort the data descending in time
    data.sort((a, b) => b[0] < a[0])
    this.data = data.map(e => e[1])
    this._limit_data()
    this._notify(this.data)
  }


  async _subscribe() {
    await this._cache_load()
    if (!this.sock.connected) return this.sock.connect()

    let msg = this._get_message('subscribe')
    msg.max_count = this.max_count
    if (this.data.length) msg.since = this.data[this.data.length - 1].time

    this.sock.send(msg)
    this.subscribed = true
  }


  _unsubscribe() {
    if (this.sock.connected) this.sock.send(this._get_message('unsubscribe'))
    this.subscribed = false
  }


  _notify(data) {Object.values(this.subscribers).map(cb => {data.map(cb)})}


  update() {
    if (!this.subscribed && this.has_subscribers) this._subscribe()
    if (this.subscribed && !this.has_subscribers) this._unsubscribe()
  }


  _limit_data() {
    if (this.max_count < this.data.length) {
      let removed = this.data.splice(0, this.data.length - this.max_count)
      removed.map(entry => this._cache_del(entry))
    }
  }


  add_data(_data) {
    // Fill in missing data
    let data = []
    let last = this.data[this.data.length - 1]

    for (let entry of _data) {
      if (last != undefined) {
        let lastTime = new Date( last.time).getTime() / 1000
        let thisTime = new Date(entry.time).getTime() / 1000
        let steps    = Math.round((thisTime - lastTime) / this.period)

        if (steps < this.max_count)
          for (let i = 1; i < steps; i++) {
            let time = new Date((lastTime + this.period * i) * 1000)
            data.push({time: time.toISOString(), value: last.value})
          }

        else {
          data      = []
          this.data = []
        }
      }

      data.push(entry)
      last = entry
    }

    this._notify(data)
    this.data.push(...data)
    data.map(entry => this._cache_add(entry))
    this._limit_data()
  }


  on_message(msg) {
    let data = Array.isArray(msg.data) ? msg.data.reverse() : [msg.data]
    this.add_data(data)
  }


  on_open()  {this.update()}
  on_close() {this.subscribed = false}
}


export default Subscriber
