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

import {watchEffect, reactive} from 'vue'


class Projects {
  constructor(ctx, timeout = 24 * 60 * 60 * 1000) {
    this.ctx     = ctx
    this.timeout = timeout
    this.state   = reactive({
      loading:     true,
      in_progress: {},
      projects:    {},
    })

    watchEffect(() => this._update_ids())
    setTimeout(() => this.state.loading = false, 8000)
  }


  is_loading() {return this.state.loading}


  get(id) {
    if (id) return this.state.projects[id]
    return Object.values(this.state.projects)
  }


  _update_ids() {
    let projects = {}

    for (let unit of this.ctx.$machs.get_units())
      if (unit.assign.project) projects[unit.project] = true

    projects = Object.keys(projects)

    if (projects != this.state.ids) {
      this.state.ids = projects
      this._trigger_update()
    }
  }


  _trigger_update() {
    if (this.update_timer == undefined)
      this.update_timer = setTimeout(() => this._update(), 1000)
  }


  async _update() {
    delete this.update_timer

    // Load project data
    for (let id of this.state.ids)
      try {await this._load(id)} catch(e) {}

    // Remove old projects
    for (let id of Object.keys(this.state.projects))
      if (!id in this.state.ids) delete this.state.projects[id]
  }


  async _load(id) {
    if (this.state.projects[id] || this.state.in_progress[id]) return

    this.state.in_progress[id] = true
    try {
      let url = this.ctx.$api.url + '/project/' + id
      let data = await this.ctx.$api.fetch({
        path: '/project/' + id, expire: 0,
        action: 'Downloading project description.',
        error_cb: () => false // Don't show error message
      })

      if (!data.error) {
        data.id = parseInt(id)
        this.state.projects[id] = data
      }

    } finally {this.state.in_progress[id] = false}
  }
}

export default Projects
