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

                  For information regarding this software 358,797,681email:
                                 Joseph Coffland
                          joseph@cauldrondevelopment.com

\******************************************************************************/

import Sock from './sock.js'

class Team {
  constructor(sock, team, max_count = 10000) {
    this.sock        = sock
    this.team        = team
    this.subscribers = {}
    this.data        = []
    this.max_count   = max_count
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


  _get_message(action) {
    return {
      type:       action,
      timeseries: 'team.score',
      team:       this.team,
      '$ref':     'team-' + this.team
    }
  }


  _subscribe() {
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


  update() {
    if (!this.subscribed && this.has_subscribers) this._subscribe()
    if (this.subscribed && !this.has_subscribers) this._unsubscribe()
  }


  add_data(data) {
    Object.values(this.subscribers).map(cb => {data.map(cb)})
    this.data.push(...data)

    // Remove any excess data
    if (this.max_count < this.data.length)
      this.data.splice(0, this.data.length - this.max_count)
  }


  on_message(msg) {
    let data = Array.isArray(msg.data) ? msg.data.reverse() : [msg.data]
    this.add_data(data)
  }


  on_open()  {this.update()}
  on_close() {this.subscribed = false}
}


class APISock extends Sock {
  constructor(ctx, ...args) {
    super(...args)
    this.ctx    = ctx
    this.teams  = {}
    this.nextID = 1
  }


  subscribe_team(team, cb) {
    if (this.teams[team] == undefined)
      this.teams[team] = new Team(this, team)

    return this.teams[team].add_subscriber(cb)
  }


  unsubscribe(id) {
    Object.values(this.teams).map(t => t.del_subscriber(id))
  }


  on_message(msg) {
    if (msg.data != undefined && msg.data.message != undefined) {
      console.error(msg.data.message)
      console.debug(msg)
      return
    }

    if ((msg.$ref || '').substr(0, 5) == 'team-')
      this.teams[parseInt(msg.$ref.substr(5))].on_message(msg)

    else throw 'Unsupported API Websocket message: ' + JSON.stringify(msg)
  }


  on_open(event) {Object.values(this.teams).map(t => t.on_open(event))}


  on_close(event) {
    setTimeout(() => this.connect(), 1000)
    Object.values(this.teams).map(t => t.on_close(event))
  }


  on_error(event) {console.debug('APISock error', event)}
}


export default APISock
