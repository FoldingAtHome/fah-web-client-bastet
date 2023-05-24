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
  constructor(api, adata, timeout = 60 * 60 * 1000) {
    this.api      = api
    this.adata    = adata
    this.data     = reactive({stats: {}})
    this.timeout  = timeout
    this.team_url = 'https://stats.foldingathome.org/team/'
    this.user_url = 'https://stats.foldingathome.org/donor/'

    watchEffect(() => this._update())
  }


  get_data() {return this.data.stats}


  async _update() {
    // Update stats periodically (cached up to `timeout`)
    setTimeout(() => this._update(), 60 * 1000)

    let {name, team, passkey} = this.adata

    if (!name || (name.toLowerCase() == 'anonymous' && !team))
      return this.data.stats = {}

    let path = `/user/${name}/stats`
    let data = {team}
    if (passkey) data.passkey = passkey

    this.data.stats = await this.api.fetch({
      path, data, action: 'Getting user stats', expire: this.timeout})
  }
}


export default Stats
