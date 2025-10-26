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

import Sock       from './sock.js'
import Subscriber from './subscriber.js'


class TeamSubscriber extends Subscriber {
  constructor(sock, team, max_count = 10000) {
    super(sock, max_count)
    this.ref = `team-${team}`
    this.msg = {timeseries: 'team.score', team, '$ref': this.ref}
  }
}


class UserSubscriber extends Subscriber {
  constructor(sock, uid, pid, max_count = 10000) {
    super(sock, max_count)
    this.ref = `user-${uid}-${pid}`
    this.msg = {timeseries: 'user.score', uid, pid, '$ref': this.ref}
  }
}


function get_chart_subscriber(sock, chart) {
  switch (chart.type) {
  case 'team': return new TeamSubscriber(sock, chart.team)
  case 'user': return new UserSubscriber(sock, chart.uid, chart.pid)
  }
}


class APISock extends Sock {
  constructor(ctx, ...args) {
    super(...args)
    this.ctx    = ctx
    this.subs   = {}
    this.nextID = 1
  }


  subscribe(chart, cb) {
    let sub = get_chart_subscriber(this, chart)
    let ref = sub.ref

    if (this.subs[ref] == undefined) this.subs[ref] = sub

    return {ref, id: this.subs[ref].add_subscriber(cb)}
  }


  unsubscribe(o) {this.subs[o.ref].del_subscriber(o.id)}


  on_message(msg) {
    if (msg.data != undefined && msg.data.message != undefined) {
      console.error(msg.data.message)
      console.debug(msg)
      return
    }

    let sub = this.subs[msg.$ref]
    if (sub != undefined) sub.on_message(msg)

    else throw 'Unsupported API Websocket message: ' + JSON.stringify(msg)
  }


  on_open(event) {Object.values(this.subs).map(t => t.on_open(event))}


  on_close(event) {
    setTimeout(() => this.connect(), 1000)
    Object.values(this.subs).map(t => t.on_close(event))
  }


  on_error(event) {console.debug('APISock error', event)}
}


export default APISock
