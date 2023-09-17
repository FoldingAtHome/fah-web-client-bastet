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


function update_obj(data, update) {
  let i = 0

  while (i < update.length - 2) {
    let key = clean_key(update[i++])

    if (data[key] == undefined) {
      let isList = i == update.length - 1 || Number.isInteger(update[i])
      data[key] = isList ? [] : {}
    }

    data = data[key]
  }

  let key   = clean_key(update[i++])
  let value = update[i]

  if (Array.isArray(data) && key < 0) {
    if (key === -1) data.push(value)
    else data.splice(data.length, 0, ...value)

  } else if (value === null) {
    if (Array.isArray(data)) data.splice(key, 1)
    else delete data[key]

  } else data[key] = value
}



class Machine {
  constructor(id, api, aid) {
    this.id       = id
    this.api      = api
    this.aid      = aid
    this.cache    = this.api.cache
    this.name     = id
    this.state    = reactive({
      connected: false,
      data:      {config: {}, info: {}}
    })
  }


  get_id()      {return this.id}
  get_name()    {return this.name}
  get_data()    {return this.state.data}
  get_url(path) {return this.get_id() + path}
  get_config()  {return this.state.data.config || {}}
  get_info()    {return this.state.data.info   || {}}
  get_version() {return this.get_info().version}


  get_conn()     {return this.conn}
  set_conn(conn) {this.conn = conn}


  is_direct() {return this.get_conn() && this.get_conn().is_direct()}


  *[Symbol.iterator]() {
    let data = this.get_data()

    if (data.units)
      for (let unit of data.units)
        yield unit
  }


  set_name(name) {this.name = name}


  save_name(name) {
    this.name = name
    this.api.put('/account/machines/' + this.id, {name})
  }


  is_outdated(latest) {
    let current = this.get_version()
    return current && util.version_less(current, latest)
  }


  is_connected() {return this.state.connected}


  is_paused() {
    if (!this.state.data.config) return false
    return this.state.data.config.paused
  }


  is_active() {
    if (!this.is_connected()) return false

    let units = this.state.data.units

    if (units && units.length)
      for (let unit of units)
        if (!unit.paused) return true

    return false
  }


  is_linked() {
    if (!this.is_direct()) return true
    let info = this.get_info()
    return info.account == this.aid
  }


  fold()            {this.send({cmd: 'unpause'})}
  finish()          {this.send({cmd: 'finish'})}
  pause()           {this.send({cmd: 'pause'})}
  dump(unit)        {this.send({cmd: 'dump',   unit})}
  configure(config) {this.send({cmd: 'config', config})}
  link(token)       {this.send({cmd: 'link',   token, name: this.name})}


  async unlink() {
    if (this.is_connected()) this.send({cmd: 'unlink'})
    return this.api.delete('/account/machines/' + this.id)
  }


  visualize_unit(unit) {
    if (this.vizUnit == unit) return
    this.vizUnit = unit || undefined
    this._send_viz_enable()
  }


  log_enable(enable) {
    if (this.logEnabled == enable) return
    this.logEnabled = enable
    this._send_log_enable()
  }


  async send(msg) {return this.get_conn().send(msg)}
  on_open()  {this.first = true}
  on_close() {this.state.connected = false}
  close() {if (this.get_conn()) this.get_conn().close()}


  async on_message(msg) {
    msg = clean_keys(msg)
    console.debug(this.get_name() + ':', msg)

    if (this.first) {
      this.state.connected = true
      this.state.data = msg
      this._update()

    } else if (Array.isArray(msg)) {
      update_obj(this.state.data, msg)

      if (msg.length && msg[0] == 'viz') {
        let key   = msg.slice(0, -1).join('/')
        let value = msg.slice(-1)[0]
        await this.cache.set(key, value)
      }
    }

    this.first = false
  }


  async _viz_get_frames(unit) {
    const data = this.get_data()

    if (!data.viz) data.viz = {}

    // First try to load from cache
    let viz = data.viz[unit]
    if (!viz) viz = {frames: []}

    if (!viz.topology) {
      let key = 'viz/' + unit + '/topology'
      viz.topology = await this.cache.get(key, 0)
    }

    if (viz.topology) {
      for (let i = 0; i < 1000; i++) {
        if (viz.frames[i]) break
        let key = 'viz/' + unit + '/frames/' + i
        viz.frames[i] = await this.cache.get(key, 0)
        if (!viz.frames[i]) break
      }

      data.viz[unit] = viz
    }

    return viz.frames.length
  }


  async _send_viz_enable() {
    if (!this.is_connected()) return
    const unit  = this.vizUnit
    const frame = await this._viz_get_frames(unit)
    this.send({cmd: 'viz', unit, frame})
  }


  _send_log_enable() {
    if (this.is_connected()) this.send({cmd: 'log', enable: this.logEnabled})
  }


  _update() {
    if (this.vizUnit)    this._send_viz_enable()
    if (this.logEnabled) this._send_log_enable()
  }
}

export default Machine
