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

import {watchEffect, reactive, toRaw} from 'vue'
import Machine from './machine.js'


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
        if (!found[mach.id]) {
          if (mach.is_direct()) continue // Don't remove direct connections
          mach.close()
          delete this.machines[mach.id]
        }
    })
  }


  is_empty()  {return !this.get_count()}
  get_count() {return Object.values(this.machines).length}


  *[Symbol.iterator]() {
    for (let mach of Object.values(this.machines))
      yield mach
  }


  set(id, mach) {
    if (this.machines[id]) {
      if (toRaw(this.machines[id]) == mach) return
      this.machines[id].close()
    }

    this.machines[id] = mach
  }


  has(id) {return this.machines[id] != undefined}
  get(id) {return this.machines[id]}
  add(id) {this.set(id, this.create(id)); return this.get(id)}
  del(id) {delete this.machines[id]}
  create(id) {return new Machine(id, this.ctx)}


  get_local() {
    for (let mach of this)
      if (mach.is_direct()) return mach
  }


  get_local_config(group) {
    let local = this.get_local()
    return local ? local.get_config(group) : {}
  }


  *get_units() {for (let mach of this) yield* mach}


  async set_state(state) {
    if (this.ctx.$node.active)
      await this.ctx.$node.broadcast('state', {state})

    for (let mach of this)
      if (mach.is_direct())
        await mach.set_state(state)
  }
}

export default Machines
