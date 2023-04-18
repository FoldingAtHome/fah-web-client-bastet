/******************************************************************************\

                  This file is part of the Folding@home Client.

          The fah-client runs Folding@home protein folding simulations.
                    Copyright (c) 2001-2023, foldingathome.org
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

import {reactive, watchEffect} from 'vue'
import Sock   from './sock.js'
import util   from './util.js'

const default_host = localStorage.getItem('client-host') || '127.0.0.1'
const default_port = localStorage.getItem('client-port') || 7396


class Client extends Sock {
  constructor(address = '', ...args) {
    let peer = util.parse_peer_address(address)
    if (!peer) throw 'Invalid peer address "' + address + "'"

    let host = peer.host || default_host
    let port = peer.port || default_port
    let path = peer.path || ''

    let url = 'ws://' + host + ':' + port + '/api/websocket' + path
    super(url, ...args)

    this.state = reactive({
      host:        peer.host,
      port:        peer.port,
      path:        peer.path,
      address,
      default:     address == '',
      connected:   false,
      log_enabled: false,
      viz_unit:    undefined,
      stats:       util.retrieve('fah-stats', 0),
      data:        {}
    })

    this.connect()
  }


  version() {
    return this.state.data.info ? this.state.data.info.version : undefined
  }


  outdated(latest) {
    let current = this.version()
    return current && util.version_less(current, latest)
  }


  on_open() {
    this.first = true
    this.state.connected = true
    this.watch_config_stop = watchEffect(() => {this.update_stats()})
  }


  on_close(event) {
    this._clear_ping()
    this.state.connected = false
    this.state.data = {}
    if (this.watch_config_stop) this.watch_config_stop()
  }


  _clear_ping() {
    if (this._ping_timer != undefined) clearTimeout(this._ping_timer)
    delete this._ping_timer
  }


  on_message(msg) {
    console.debug(this.state.address + ':', msg)

    if (this.first) {
      this.state.data = msg
      this._update()

    } else if (Array.isArray(msg))
      util.update(this.state.data, msg)

    this.first = false

    // Update keep alive timer
    if (util.version_less('8.1.17', this.version())) {
      this._clear_ping()
      this._ping_timer = setTimeout(() => {
        console.log(this.state.address + ': timedout')
        this.close()
      }, 30000)
    }
  }


  _update() {
    if (this.viz_unit)    this._send_viz_enable()
    if (this.log_enabled) this._send_log_enable()
  }


  paused() {
    if (!this.state.data.config) return false
    return this.state.data.config.paused
  }


  fold()            {this.send({cmd: 'unpause'})}
  finish()          {this.send({cmd: 'finish'})}
  pause()           {this.send({cmd: 'pause'})}
  dump(unit)        {this.send({cmd: 'dump', unit})}
  configure(config) {this.send({cmd: 'config', config})}


  fold_anon() {
    let config = this.state.data.config
    config.fold_anon = true
    this.configure(config)
  }


  waiting_for_config() {
    let config = this.state.data.config

    return config && config.fold_anon === false &&
      (!config.user || config.user.toLowerCase() == 'anonymous') &&
      !config.team && !config.passkey
  }


  is_active() {
    let units = this.state.data.units

    if (units && units.length)
      for (let unit of units)
        if (!unit.paused) return true

    return false
  }


  viz_get_frames() {
    let unit = this.viz_unit
    if (unit && this.state.data.viz && this.state.data.viz[unit])
      return this.state.data.viz[unit].frames.length
  }


  _send_viz_enable() {
    if (!this.connected) return
    const unit   = this.viz_unit
    const frames = this.viz_get_frames()
    this.send({cmd: 'viz', unit, frames})
  }


  visualize_unit(unit) {
    if (this.viz_unit == unit) return
    this.viz_unit = unit || undefined
    this._send_viz_enable()
  }


  _send_log_enable() {
    if (this.connected) this.send({cmd: 'log', enable: this.log_enabled})
  }


  log_enable(enable) {
    if (this.log_enabled == enable) return
    this.log_enabled = enable
    this._send_log_enable()
  }


  update_stats() {
    // TODO update stats periodically
    if (!this.state.data.config) return

    let {user, team, passkey} = this.state.data.config
    if (!user || (user.toLowerCase() == 'anonymous' && !team)) return

    let url = util.api_url + `/user/${user}/stats?team=${team}`
    if (passkey) url += `&${passkey}`

    fetch(url)
      .then(r => r.json())
      .then(data => {
        let config = this.state.data.config

        if (user == config.user && team == config.team &&
            passkey == config.passkey) {
          this.state.stats = data
          util.store('fah-stats', data)
        }
      })
  }
}

export default Client
