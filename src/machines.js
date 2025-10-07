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

import {watchEffect, reactive, toRaw} from 'vue'
import Machine from './machine.js'
import Unit    from './unit.js'


class Machines {
  constructor(ctx) {
    this.ctx      = ctx
    this.machines = reactive({})

    watchEffect(() => {
      if (!ctx.$account.data.machines) return

      // Add new machines and set machine name
      let found = {}
      for (let config of ctx.$account.data.machines) {
        let mach = this.get(config.id)
        if (!mach) mach = this.add(config.id)
        mach.set_name(config.name)
        found[config.id] = true
      }

      // Erase removed machines
      for (let mach of this)
        if (!found[mach.get_id()]) {
          if (mach.is_direct()) continue // Don't remove direct connections
          mach.close()
          this.del(mach.get_id())
        }
    })
  }


  get is_empty() {return !this.count}
  get count() {return Array.from(this).length}


  *[Symbol.iterator]() {
    for (let mach of Object.values(this.machines))
      if (!mach.is_hidden()) yield mach
  }


  set(id, mach) {
    if (this.machines[id]) {
      if (toRaw(this.machines[id]) == mach) return
      this.machines[id].close()
    }

    this.machines[id] = mach
    mach.wus_enable(this.wus_enabled)
  }


  has(id) {return id in this.machines}
  get(id) {return this.machines[id]}
  add(id) {this.set(id, this.create(id)); return this.get(id)}
  del(id) {delete this.machines[id]}
  create(id) {return new Machine(id, this.ctx)}


  get_direct_id() {
    let mach = this.get_direct()
    if (mach) return mach.get_id()
  }


  get_direct() {return this.machines['__direct__']}


  get_direct_config(group) {
    let mach = this.get_direct()
    return mach ? mach.get_config(group) : {}
  }


  *get_units() {
    let found = {}

    for (let mach of this) {
      let units = (mach.get_data().wus || []).concat(mach.get_units())

      for (let unit of units) {
        if (!(unit instanceof Unit)) unit = new Unit(this.ctx, unit, mach)

        if (unit.id && unit.project && !found[unit.id]) {
          found[unit.id] = true
          yield unit
        }
      }
    }
  }


  get_unit(id) {
    for (let unit of this.get_units())
      if (unit.id == id) return unit
    return {}
  }


  active_unit_sum(fn) {
    return Array.from(this).reduce((sum, mach) => {
      if (!mach.is_recently_connected) return sum

      return mach.get_units().reduce((sum, unit) => {
        if (unit.state != 'RUN' && !unit.finish) return sum
        let value = fn(unit)
        return sum + (isFinite(value) ? value : 0)
      }, sum)
    }, 0)
  }


  get ppd()         {return this.active_unit_sum(unit => unit.unit.ppd)}


  async set_state(state) {
    await this.ctx.$node.broadcast('state', {state})

    for (let mach of this)
      if (mach.is_direct())
        await mach.set_state(state)
  }


  wus_enable(enable) {
    for (let mach of this)
      mach.wus_enable(enable)

    this.wus_enabled = enable
  }
}

export default Machines
