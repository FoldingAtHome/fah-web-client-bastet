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

import {reactive} from 'vue'
import Updatable from './updatable.js'
import Unit      from './unit.js'


class Machine {
  constructor(id, ctx) {
    this.ctx   = ctx
    this.aid   = ctx.$account.data.id
    this.cache = ctx.$cache
    this.util  = ctx.$util
    this.state = reactive({
      id,
      name:      id,
      connected: false,
      data:      {}
    })
  }


  get_id()      {return this.state.id}
  get_name()    {return this.state.name}
  get_data()    {return this.state.data}
  get_viz(unit) {return (this.get_data().viz || {})[unit] || {}}
  get_url(path) {return this.get_id() + path}
  get_info()    {return this.get_data().info || {}}
  get_version() {return this.get_info().version}
  get_os()      {return this.get_info().os}
  get_groups()  {return Object.keys(this.get_data().groups || {'': null})}
  get_group(name = '') {return (this.get_data().groups || {})[name] || {}}


  get_title() {
    if (this.is_direct()) return 'Direct client at ' + this.conn.address
    return 'F@H ID ' + this.get_id()
  }


  get_config(group) {
    if (group == undefined) return this.get_data().config || {}
    return this.get_group(group).config || {}
  }


  get_resources(group = '', max_length) {
    let l = []
    let config = this.get_config(group)

    if (config.cpus) l.push(config.cpus + ' CPUs')

    for (let gpu of this.get_gpus(group))
      l.push(gpu.description)

    let s = l.length ? l.join(', ') : 'No resources'

    if (max_length && max_length < s.length)
      return s.substring(0, max_length - 3) + '...'

    return s
  }


  has_resources(group = '') {
    return this.get_config(group).cpus || this.get_gpus(group).length
  }


  get_conn() {return this.conn}
  set_conn(conn) {this.conn = conn}
  is_direct() {return this.get_conn() && this.get_conn().is_direct()}


  get_units() {
    return (this.get_data().units || []).map(
      unit => new Unit(this.ctx, unit, this))
  }


  is_hidden() {
    if (this.is_direct())
      return !this.is_connected() && !this.ctx.$util.get_direct_address()

    if (this.ctx.$machs == undefined) return false
    return this.get_id() == this.ctx.$machs.get_direct_id()
  }


  is_empty() {!this.get_units().length}
  set_name(name) {this.state.name = name}


  async save_name(name) {
    this.set_name(name)
    await this.ctx.$api.put('/account/machines/' + this.get_id(), {name})
    this.send_command('restart')
  }


  is_outdated() {
    const latest  = this.ctx.$api.get_latest_version()
    const current = this.get_version()
    return latest && current && this.util.version_less(current, latest)
  }


  is_connected() {return this.state.connected}


  is_recently_connected() {
    return this.is_connected() ||
      new Date().getTime() < this.last_connected + 5 * 60 * 1000
  }


  is_paused(group) {
    if (group != undefined) return this.get_config(group).paused

    for (let group of this.get_groups())
      if (!this.is_paused(group))
        return false

    return true
  }


  is_active() {
    if (!this.is_connected()) return false

    for (let unit of this.get_units())
      if (!unit.paused) return true

    return false
  }


  is_linked() {
    if (!this.is_direct()) return true
    return this.get_info().account == this.aid
  }


  get_gpus(group = '') {
    let info   = this.get_info()
    let config = this.get_config(group)
    let gpus   = []

    if (config.gpus && info.gpus)
      for (let id in config.gpus)
        if (info.gpus[id] && config.gpus[id].enabled)
          gpus.push(info.gpus[id])

    return gpus
  }


  async send_command(cmd, data = {}) {
    data = Object.assign({}, data, {cmd, time: new Date().toISOString()})
    return this.send(data)
  }


  async set_state(state, group) {
    let data = {state}
    if (group != undefined) data.group = group
    return this.send_command('state', data)
  }


  async auto_link() {
    if (!this.is_connected()) return

    // Auto link if not already linked
    let token = this.ctx.$adata.token
    if (!token || this.get_info().account) return

    await this.link(token)

    return this.ctx.$root.message('info', 'Auto-linking client',
      'The local machine has been automatically linked to your ' +
      'Folding@home account.  Its configuration will remain ' +
      'synchronized with the account.')
  }


  async dump(unit)        {return this.send_command('dump',   {unit})}
  async configure(config) {return this.send_command('config', {config})}


  async link(token)       {
    return this.send_command('link', {token, name: this.get_name()})
  }


  async unlink() {
    await this.ctx.$api.delete('/account/machines/' + this.get_id())
    if (this.is_connected()) this.send_command('restart')
  }


  visualize_unit(unit) {
    if (this.vizUnit == unit) return
    this.vizUnit = unit
    this._send_viz_enable()
  }


  log_enable(enable) {
    if (this.logEnabled == enable) return
    console.debug(this.get_name() + ': log ' +
      (enable ? 'enabled' : 'disabled'))
    this.logEnabled = enable
    this._send_log_enable()
  }


  wus_enable(enable) {
    if (this.wusEnabled == enable) return
    this.wusEnabled = enable
    this._send_wus_enable()
  }


  async send(msg) {
    console.debug(this.get_name(), msg)
    return this.get_conn().send(msg)
  }


  on_open()  {this.first = true}


  on_close() {
    this.state.connected = false
    this.state.last_connected = new Date().getTime()
  }


  close()    {if (this.get_conn()) this.get_conn().close()}


  async on_message(msg) {
    console.debug(this.get_name() + ':', msg)

    if (this.first) {
      this.first = false
      this.state.connected = true
      this.state.data = new Updatable(msg)

      if (this.vizUnit)    this._send_viz_enable()
      if (this.logEnabled) this._send_log_enable()
      if (this.wusEnabled) this._send_wus_enable()

    } else if (Array.isArray(msg)) {
      this.state.data.do_update(msg)

      // Cache viz
      if (msg.length && msg[0] == 'viz') {
        let key   = msg.slice(0, -1).join('/')
        let value = msg.slice(-1)[0]
        await this.cache.set(key, value)
      }

      // Trim log
      let log = this.state.data.log || []
      const maxLog = 1e5
      if (maxLog < log.length) {
        log.splice(0, log.length - maxLog)
        log.splice(0, log.length / 3) // Drop a 3rd so the log stops shifting
      }
    }
  }


  async _viz_get_frames(unit) {
    const data = this.get_data()
    if (!data.viz) data.viz = {}

    // First try to load from cache
    let viz = this.get_viz(unit)

    if (!viz.topology) {
      let key = 'viz/' + unit + '/topology'
      viz.topology = await this.cache.get(key, 0)
    }

    if (!viz.frames) viz.frames = []

    if (viz.topology) {
      for (let i = 0; i < 1000; i++) {
        if (viz.frames[i]) break
        let key = 'viz/' + unit + '/frames/' + i
        let frame = await this.cache.get(key, 0)
        if (!frame) break
        viz.frames[i] = frame
      }

      data.viz[unit] = viz
    }

    return viz.frames.length
  }


  dup_state(mach) {
    this.visualize_unit(mach.vizUnit)
    this.log_enable(mach.logEnabled)
    this.wus_enable(mach.wusEnabled)
  }


  async _send_viz_enable() {
    if (!this.is_connected()) return
    const unit  = this.vizUnit
    const frame = await this._viz_get_frames(unit)
    this.send_command('viz', {unit, frame})
  }


  _send_log_enable() {
    if (this.is_connected()) this.send_command('log', {enable: this.logEnabled})
  }

  _send_wus_enable() {
    if (this.is_connected()) this.send_command('wus', {enable: this.wusEnabled})
  }

}

export default Machine
