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

import {watch, watchEffect, reactive} from 'vue'


class Stats {
  constructor(ctx, timeout = 60 * 60 * 1000) {
    this.ctx   = ctx
    this.api   = ctx.$api
    this.adata = ctx.$account.data
    this.machs = ctx.$machs
    this.state = reactive({
      user:    undefined,
      team:    undefined,
      passkey: undefined,
      stats:   {}
    })
    this.timeout = timeout
    this.url = 'https://stats.foldingathome.org'

    watch([
        () => this.state.user,
        () => this.state.team,
        () => this.state.passkey
      ], () => this._get_stats())

    watchEffect(() => this._update_config())

    this._update()
  }


  get_data() {return this.state.stats}


  get_team() {
    let ateam
    for (let team of (this.adata.teams || []))
      if (team.team == this.state.team) ateam = team

    for (let team of this.state.stats.teams || [])
      if (team.team == this.state.team) {
        if (ateam != undefined) return Object.assign({}, team, ateam)
        return team
      }

    return {}
  }


  get charts() {
    let charts = []

    let team = this.state.team
    if (team) charts.push({type: 'team', team})

    let uid = this.state.stats.id
    let pid = this.state.stats.pid || 0
    if (uid) charts.push({type: 'user', uid, pid, user: this.state.user})

    return charts
  }


  is_anon() {
    let user = this.state.user
    return !user || user.toLowerCase() == 'anonymous'
  }


  _update() {
    // Update stats periodically (cached up to `timeout`)
    setTimeout(() => this._update(), 60 * 1000)
    this._get_stats()
  }


  _get_config() {
    // Use account settings
    if (this.ctx.$account.logged_in) return this.adata

    // Otherwise use direct machine settings
    return this.machs.get_direct_config()
  }


  _update_config() {
    let {user, team, passkey} = this._get_config()

    this.state.user    = user
    this.state.team    = team
    this.state.passkey = passkey
  }


  async _get_team_stats(team) {
    let data = await this.api.fetch({
      path: `/team/${team}`, error_cb: () => false, expire: this.timeout})

    if (data && data.id != undefined)
      return Object.assign(data, {
        team,
        tscore: data.score,
        twus:   data.wus,
        score:  0,
        wus:    0,
      })

    return {team, name: team, tscore: 0, twus: 0, score: 0, wus: 0}
  }


  async _get_stats() {
    let {user, team, passkey} = this.state

    if (this.is_anon() && !team) return this.state.stats = {}

    let path = `/user/${encodeURIComponent(user)}`
    let data = team == undefined ? {} : {team}
    if (this.state.passkey) data.passkey = this.state.passkey

    let stats = await this.api.fetch({
      path, data, error_cb: () => false, expire: this.timeout})
    if (stats && stats.name) this.state.stats = stats

    if (!this.state.stats) {
      this.state.stats = {
        name: user, id: 0, score: 0, wus: 0, active_7: 0, active_50: 0,
        teams: [await this._get_team_stats(team)]
      }
    }
  }
}


export default Stats
