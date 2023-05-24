<!--

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

-->

<script>
import LoginDialog   from './LoginDialog.vue'
import MachRow       from './MachRow.vue'
import Unit          from './Unit.vue'
import ProjectsView  from './ProjectsView.vue'
import SliderSwitch  from './SliderSwitch.vue'
import News          from './News.vue'
import util          from './util.js'


export default {
  name: 'HomeView',
  components: {LoginDialog, MachRow, Unit, News, ProjectsView, SliderSwitch},


  data() {
    return {
      dark_mode: util.retrieve_bool('fah-dark-mode', 0)
    }
  },


  watch: {
    dark_mode(enabled) {
      if (enabled) document.body.classList.add('dark')
      else document.body.classList.remove('dark')

      util.store_bool('fah-dark-mode', enabled)
    }
  },


  computed: {
    units()     {return [...this.$machs.get_units()]},
    stats()     {return this.$stats.get_data()},
    is_anon()   {return !this.name || this.name.toLowerCase() == 'anonymous'},
    name()      {return this.$adata.name},
    team()      {return this.$adata.team},
    user_url()  {return this.$stats.user_url + this.name},
    team_url()  {return this.$stats.team_url + this.team},
    team_name() {return this.$stats.team_name || this.team},


    points_earned() {
      if (!this.stats.earned || this.is_anon) return '—'
      return this.stats.earned.toLocaleString()
    },


    team_points() {
      let contrib = util.human_number(this.stats.contributed)
      let total   = util.human_number(this.stats.team_total)

      return `${contrib} of ${total}`
    }
  },


  mounted() {
    if (this.dark_mode) document.body.classList.add('dark')
  },


  methods: {
    async login() {
      let result = await this.$refs.login_dialog.exec()

      switch (result.response) {
      case 'login':    return this.$account.login_with_passphrase(result.data)
      case 'register': return this.$account.register(result.data)
      case 'cancel':   return
      default:         return this.$account.login(result.response) // OAuth2
      }
    },


    fold() {this.$root.fold()},
    pause() {this.$root.pause()}
  }
}
</script>

<template lang="pug">
.home-view.page-view
  .view-header-container
    .view-header
      .logo-block
        FAHLogo

      .user-info(v-if="name")
        template(v-if="is_anon")
          label Folding anonymously

        template(v-else)
          label Folding as
          .user #[a(:href="user_url", target="_blank") {{name}}]

        template(v-if="team")
          label for team
          .team
            object.team-logo(:data="stats.team_urllogo", type="image/jpeg")
            a(:href="team_url", target="_blank") {{team_name}}

      .points(v-if="stats.url && !is_anon")
        label Points earned
        .user(title="Total points you've earned.") {{points_earned}}

        template(v-if="team")
          label Team points
          .team(title="Points you've contributed to the team.") {{team_points}}

      .actions(:class="{'icon-buttons': $adata.avatar}")
        Button.button-image(v-if="$adata.avatar", route="/account",
          :image="$adata.avatar",
          :title="$adata.name + ': Account Settings and Logout.'")

        Button(v-else-if="$adata.created", route="/account", icon="cog",
          :title="$adata.name + ': Account Settings and Logout.'",
          name="account")

        Button(v-else, text="Login", icon="sign-in", @click="login",
          title="Login to Folding@home or register a new account.")

        SliderSwitch(v-model="dark_mode", title="Toggle dark mode.")

  .view-body
    .control
      Button.button-success(text="Start All", @click="fold", icon="play",
        :disabled="$machs.is_empty()")
      Button(text="Pause All", @click="pause", icon="pause",
        :disabled="$machs.is_empty()")

    .machines
      h2 Machines

      table
        tr
          th.name Name
          th.version Version
          th.resources Resources
          th.actions Actions

        MachRow(v-for="mach in $machs", :mach="mach")

        tr.no-data(v-if="$machs.is_empty()")
          td(colspan="100")
            p No folding machines found.
            p Login or install the Folding@home client software.

    .units
      h2 Work Units
      table
        tr
          th.machine Machine
          th.project Project
          th.resources Resources
          th.status Status
          th.progress Progress
          th.eta ETA
          th.actions Actions

        template(v-for="mach in $machs")
          Unit(v-for="unit in mach", :unit="unit", :mach="mach")

        tr.no-data(v-if="!units.length")
          td(colspan="100")
            p No work units.
            p Start folding to download work units.

    ProjectsView
    News

  LoginDialog(ref="login_dialog")
</template>

<style lang="stylus">
@import('colors.styl')

.home-view
  .view-header
    > :first-child
      flex 1

    label
      white-space nowrap
      display block

    > *
      text-align center

    .logo-block
      display flex
      flex-direction column
      gap 0.5em

      .client-version
        font-size 120%
        text-align left

    .user-info, .points
      > div
        font-weight bold

      > .user
        font-size 130%

      > *:nth-child(3)
        margin-top 0.5em

      object
        vertical-align middle

    .fah-logo
      text-align left

    .user-info
      a:visited, a:link
        color link-alt

      a:hover
        color link-color

      .team-logo
        max-width 24px
        max-height 24px
        margin-right 0.25em

    .actions
      display flex

      a.button
        padding 0.5em 0.75em

      > *, a.button
        width 8em !important

      &.icon-buttons
        a.button
          padding 0

        > *, a.button
          width 48px !important
          border-radius 4px
          overflow hidden

  .control
    display flex
    justify-content center
    gap 0.5em
    text-align center

  .view-body
    > *
      > h2, > h3
        text-align center

  .units, .machines
    margin 1em auto
    max-width 60em

    table
      border-collapse collapse

    tr:nth-child(odd)
      background table-odd

    tr:nth-child(even)
      background table-even

    th
      color header-fg
      background header-bg

    td, th
      text-align left
      border 1px solid border-color
      padding 0.25em 0.5em
      white-space nowrap

      &.actions
        display flex
        gap 0.5em

        .button
          text-align center

    .no-data
      p
        text-align center
        margin 0.5em

  .machines .resources, .units .progress
    width 100%

  .news-feed, .projects
    margin-top 2em

@media (max-width 800px)
  .units
    td, th
      &.eta, &.resources
        display none
</style>
