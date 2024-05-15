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
import util from './util.js'


function clean_key(key) {
  if (typeof key == 'string') return key.replace('-', '_')
  return key
}


function clean_keys(data) {
  if (Array.isArray(data)) {
    let r = []

    for (const value of data)
      r.push(clean_keys(value))

    return r
  }

  if (util.isObject(data)) {
    let r = {}

    for (const [key, value] of Object.entries(data))
      r[clean_key(key)] = clean_keys(value)

    return r
  }

  return data
}


function update_obj(obj, update) {
  let i = 0

  while (i < update.length - 2) {
    let key = clean_key(update[i++])

    if (obj[key] == undefined)
      obj[key] = Number.isInteger(update[i]) ? [] : {}

    obj = obj[key]
  }

  let is_array = Array.isArray(obj)
  let key      = clean_key(update[i++])
  let value    = update[i]

  if      (is_array && key   === -1)   obj.push(value)
  else if (is_array && key   === -2)   obj.splice(obj.length, 0, ...value)
  else if (is_array && value === null) obj.splice(key, 1)
  else if (value === null)             delete obj[key]
  else                                 obj[key] = value
}



class Machine {
  constructor(id, ctx) {
    this.id    = id
    this.api   = ctx.$api
    this.aid   = ctx.$account.data.id
    this.cache = this.api.cache
    this.name  = id
    this.state = reactive({
      connected: false,
      data:      {info: {}, groups: {}}
    })
  }


  get_id()      {return this.id}
  get_name()    {return this.name}
  get_data()    {return this.state.data}
  get_viz(unit) {return (this.get_data().viz || {})[clean_key(unit)] || {}}
  get_url(path) {return this.get_id() + path}
  get_info()    {return this.get_data().info || {}}
  get_version() {return this.get_info().version}
  get_groups()  {return Object.keys(this.get_data().groups || {'': null})}


  get_group(name = '') {
    let data = this.get_data()

    if (data.groups && name in data.groups)
      return data.groups[name]

    return {}
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
      return s.substr(0, max_length - 3) + '...'

    return s
  }


  get_conn()     {return this.conn}
  set_conn(conn) {this.conn = conn}


  is_direct() {return this.get_conn() && this.get_conn().is_direct()}


  *[Symbol.iterator]() {
    for (let unit of (this.get_data().units || []))
      yield unit
  }


  is_empty() {
    for (let unit of this) return false
    return true
  }


  get_unit(id) {
    for (let unit of this)
      if (unit.id == id) return unit
  }


  set_name(name) {this.name = name}


  save_name(name) {
    this.name = name
    this.api.put('/account/machines/' + this.id, {name})
  }


  is_outdated(latest) {
    const current = this.get_version()
    return current && util.version_less(current, latest)
  }


  is_connected() {return this.state.connected}


  is_paused(group) {
    if (group != undefined) return this.get_config(group).paused

    for (let group of this.get_groups())
      if (!this.get_config(group).paused)
        return false

    return true
  }


  is_active() {
    if (!this.is_connected()) return false

    for (let unit of this)
      if (!unit.paused) return true

    return false
  }


  is_linked() {
    if (!this.is_direct()) return true
    let info = this.get_info()
    return info.account == this.aid
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


  async dump(unit)        {return this.send_command('dump',   {unit})}
  async configure(config) {return this.send_command('config', {config})}


  async link(token)       {
    return this.send_command('link', {token, name: this.name})
  }


  async unlink() {
    if (this.is_connected()) this.send_command('reset')
    return this.api.delete('/account/machines/' + this.id)
  }


  visualize_unit(unit) {
    if (this.vizUnit == unit) return
    this.vizUnit = unit
    this._send_viz_enable()
  }


  log_enable(enable) {
    if (this.logEnabled == enable) return
    console.debug(this.get_name() + ': log ' + (enable ? 'enabled' : 'disabled'))
    this.logEnabled = enable
    this._send_log_enable()
  }


  async send(msg) {
    console.debug(this.get_name(), msg)
    return this.get_conn().send(msg)
  }


  on_open()  {this.first = true}
  on_close() {this.state.connected = false}
  close()    {if (this.get_conn()) this.get_conn().close()}


  async on_message(msg) {
    msg = clean_keys(msg)
    console.debug(this.get_name() + ':', msg)

    if (this.first) {
      this.state.connected = true
      this.state.data = msg

      if (this.vizUnit)    this._send_viz_enable()
      if (this.logEnabled) this._send_log_enable()

    } else if (Array.isArray(msg)) {
      update_obj(this.state.data, msg)

      if (msg.length && msg[0] == 'viz') {
        let key   = msg.slice(0, -1).join('/')
        let value = msg.slice(-1)[0]
        await this.cache.set(key, value)
      }

      // Trim log
      let log = this.state.data.log || []
      if (1e5 < log.length) log.splice(0, log.length - 1e5)
    }

    this.first = false
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

      data.viz[clean_key(unit)] = viz
    }

    return viz.frames.length
  }


  dup_state(mach) {
    this.log_enable(mach.logEnabled)
    this.visualize_unit(mach.vizUnit)
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
}

export default Machine
