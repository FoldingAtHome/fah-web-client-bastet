<!--

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

-->

<script>
import TeamDialog from './TeamDialog.vue'


function compute_max_dims(width, height, maxWidth, maxHeight) {
  if (width <= maxWidth) {
    if (height <= maxHeight) return [width, height]
    return [width, Math.floor(maxWidth * maxHeight / height)]
  }

  height = Math.floor(height * maxWidth / width)
  if (height <= maxHeight) return [maxWidth, height]
  return [Math.floor(maxWidth * maxHeight / height), maxHeight]
}


export default {
  props: {account: Object, config: Object},
  components: {TeamDialog},


  data() {
    return {new_team: {}}
  },


  computed: {
    teams() {return this.$adata.teams || []}
  },


  methods: {
    async create_team() {
      Object.assign(this.new_team, {name: '', url: ''})

      let response = await this.$refs.team_dialog.exec(this.new_team, true)
      if (response != 'ok') return

      return this.$root.pacify(async () => {
        await this.$api.post('/account/teams', this.new_team)
        await this.$account.update()
      })
    },


    async edit_team(team) {
      team = Object.assign({}, team)

      let response = await this.$refs.team_dialog.exec(team, false)
      if (response != 'ok') return

      return this.$root.pacify(async () => {
        await this.$api.put(`/account/teams/${team.team}`, team)
        await this.$account.update()
      })
    },


    async delete_team(team) {
      let response = await this.$root.message(
        'confirm', `Delete Team ${team.team}?`,
        'Deleted teams cannot be recovered. ' +
          'Are you sure you want to delete this team?',
        [
          {name: 'delete', icon: 'trash', text: 'Delete Team',
           class: 'button-caution'},
          {name: 'cancel', icon: 'times'}
        ])

      if (response == 'delete')
        return this.$root.pacify(async () => {
          await this.$api.delete(`/account/teams/${team.team}`)
          await this.$account.update()
        })
    }
  }
}
</script>

<template lang="pug">
TeamDialog(ref="team_dialog")


fieldset.settings.view-panel.account-teams
  legend
    HelpBalloon(name="Teams")
      p Here you will find a list of teams you own.
      p You can create new teams or modify an existing team's settings.
      p Note, you can only delete teams which have not yet scored any points.

  div(v-if="!teams.length") You do not currently own any F@H teams.
  table.view-table(v-else)
    thead
      tr
        th.team-logo Logo
        th.team-id Team
        th.team-name Name
        th.team-actions Actions

    tbody
      tr(v-for="team in teams")
        td.team-logo: img(:src="team.logo")

        td.team-id
          a(:href="`${$stats.url}/team/${team.team}`", target="_blank")
            | {{team.team}}

        td.team-name: component(:href="team.url", target="_blank",
          :is="team.url ? 'a' : 'span'") {{team.name}}

        td.team-actions
          div
            Button.button-icon(icon="trash", @click="delete_team(team)",
              title="Delete team.", :disabled="!!team.wus")
            Button.button-icon(icon="pencil", @click="edit_team(team)",
              title="Edit team settings.")

  .actions
    Button(text="New Team", icon="plus", @click="create_team",
      title="Create a new Folding@home team.")
</template>

<style lang="stylus">
.account-teams
  .view-table
    .team-logo img
      max-height 64px

    .team-actions
      text-align right

    .team-name
      width 100%

    .team-actions div
      display flex
      gap var(--gap)
      align-items center
      justify-content end

@media (max-width 800px)
  .account-teams
    .team-name
      display none
</style>
