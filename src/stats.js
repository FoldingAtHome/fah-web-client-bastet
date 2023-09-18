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
import util   from './util.js'
import crypto from './crypto.js'


class Stats {
  constructor(app, timeout = 60 * 60 * 1000) {
    this.api      = app.$api
    this.adata    = app.$account.data
    this.machs    = app.$machs
    this.data     = reactive({stats: {}})
    this.timeout  = timeout
    this.team_url = 'https://stats.foldingathome.org/team/'
    this.user_url = 'https://stats.foldingathome.org/donor/'

    watchEffect(() => this._get_stats())
  }


  get_data() {return this.data.stats}
  get_name() {return this.data.name}
  get_team() {return this.data.team}


  is_anon() {
    let name = this.data.name
    return !name || name.toLowerCase() == 'anonymous'
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


  _get_stats() {
    let {user, name, team, passkey} = this._get_config()

    name = user || name
    this.data.name    = name
    this.data.team    = team
    this.data.passkey = passkey

    if (this.is_anon() && !team) return this.data.stats = {}

    let path = `/user/${name}/stats`
    let data = {team}
    if (passkey) data.passkey = passkey

    this.api.fetch({
      path, data, action: 'Getting user stats', expire: this.timeout})
      .then(stats => this.data.stats = stats)
  }
}


export default Stats
