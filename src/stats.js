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

import {watch, watchEffect, reactive} from 'vue'
import util   from './util.js'
import crypto from './crypto.js'


class Stats {
  constructor(app, timeout = 60 * 60 * 1000) {
    this.api      = app.$api
    this.adata    = app.$account.data
    this.machs    = app.$machs
    this.data     = reactive({user: undefined, team: undefined, stats: {}})
    this.timeout  = timeout
    this.url      = 'https://stats.foldingathome.org'

    watch([() => this.data.user, () => this.data.team], () => this._get_stats())
    watchEffect(() => this._update_config())
    this._update()
  }


  get_data() {return this.data.stats}


  get_team() {
    for (let team of this.data.stats.teams || [])
      if (team.team == this.data.team)
        return team

    return {}
  }


  is_anon() {
    let user = this.data.user
    return !user || user.toLowerCase() == 'anonymous'
  }


  _update() {
    // Update stats periodically (cached up to `timeout`)
    setTimeout(() => this._update(), 60 * 1000)
    this._get_stats()
  }


  _get_config() {
    // Use account settings
    if (this.adata.created) return this.adata

    // Otherwise use local machine settings
    return this.machs.get_local_config()
  }


  _update_config() {
    let {user, team} = this._get_config()

    this.data.user = user
    this.data.team = team
  }


  async _get_stats() {
    let {user, team} = this.data

    if (this.is_anon() && !team) return this.data.stats = {}

    let path = `/user/${user}`
    let data = team == undefined ? {} : {team}

    this.data.stats = await this.api.fetch({
      path, data, action: 'Getting user stats', expire: this.timeout})
  }
}


export default Stats
