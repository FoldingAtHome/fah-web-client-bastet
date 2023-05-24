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
import {watchEffect, reactive} from 'vue'
import util from './util.js'


class Projects {
  constructor(api, machs, timeout = 24 * 60 * 60 * 1000) {
    this.api      = api
    this.machs    = machs
    this.loading  = {}
    this.projects = reactive({})
    this.timeout  = timeout
    watchEffect(() => this._update())
  }


  get() {return Object.values(this.projects)}


  _update() {
    let projects = {}

    for (let mach of this.machs)
      if (mach.get_data().units)
        for (let unit of mach.get_data().units)
          if (unit.assignment) projects[unit.assignment.project] = true

    this._load_all(Object.keys(projects))

    // Remove old projects
    for (let id of Object.keys(this.projects))
      if (!projects[id]) delete this.projects[id]
  }


  async _load_all(ids) {
    for (let id of ids) try {await this._load(id)} catch(e) {}
  }


  async _load(id) {
    if (this.projects[id] || this.loading[id]) return

    this.loading[id] = true
    try {
      let url = this.api.url + '/project/' + id
      let data = await this.api.fetch({
        path: '/project/' + id, expire: 0,
        action: 'Downloading project description.',
        error_cb: () => false // Don't show error message
      })

      if (!data.error) {
        data.id = parseInt(id)
        this.projects[id] = data
      }

    } finally {this.loading[id] = false}
  }
}

export default Projects
