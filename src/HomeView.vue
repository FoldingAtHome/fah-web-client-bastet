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
import ClientVersion from './ClientVersion.vue'
import PeerRow       from './PeerRow.vue'
import Unit          from './Unit.vue'
import ProjectsView  from './ProjectsView.vue'
import SliderSwitch  from './SliderSwitch.vue'
import News          from './News.vue'
import util          from './util.js'


const team_url = 'https://stats.foldingathome.org/team/'
const user_url = 'https://stats.foldingathome.org/donor/'


export default {
  name: 'HomeView',
  props: ['clients', 'peers'],
  components: {ClientVersion, PeerRow, Unit, News, ProjectsView, SliderSwitch},


  data() {
    return {
      util,
      dark_mode: util.retrieve_bool('fah-dark-mode', 0),
      latest_version: util.retrieve('fah-latest-version')
    }
  },


  watch: {
    dark_mode(enabled) {
      console.log(enabled)
      if (enabled) document.body.classList.add('dark')
      else document.body.classList.remove('dark')

      util.store_bool('fah-dark-mode', enabled, 0)
    }
  },


  computed: {
    data()   {return this.clients[''].state.data},
    config() {return this.data.config || {}},
    stats()  {return this.clients[''].state.stats || {}},


    is_anon() {
      return !this.config.user || this.config.user.toLowerCase() == 'anonymous'
    },


    user_url()  {return user_url + this.config.user},
    team_url()  {return team_url + this.config.team},


    team_name() {
      if (!this.config.team) return 'No team'
      return this.stats.team_name || this.config.team
    },


    points_earned() {
      if (!this.stats.earned || this.is_anon) return '—'
      return this.stats.earned.toLocaleString()
    },


    team_points() {
      if (!this.config.team) return '—'

      let contrib = util.human_number(this.stats.contributed)
      let total   = util.human_number(this.stats.team_total)

      return `${contrib} of ${total}`
    },


    projects() {
      let projects = {}

      for (let client of Object.values(this.clients))
        if (client.state.data.units)
          for (let unit of client.state.data.units)
            if (unit.assignment)
              projects[unit.assignment.project] = true

      return Object.keys(projects)
    }
  },


  mounted() {
    if (this.dark_mode) document.body.classList.add('dark')
    this.check_version()
  },


  methods: {
    check_version() {
      if (this.latest_version != undefined) return

      fetch('https://download.foldingathome.org/?release=beta')
        .then(r => r.json())
        .then(downloads => {
          for (let download of downloads)
            for (let group of (download.groups || []))
              for (let file of (group.files || []))
                if (file.version != undefined && file.version.length == 3) try {
                  let version = file.version.join('.')
                  util.store('fah-latest-version', version)
                  this.latest_version = version
                  return
                } catch (e) {}
        })
    },


    fold() {for (let client of Object.values(this.clients)) client.fold()},
    pause() {this.$root.pause(Object.values(this.clients))}
  }
}
</script>

<template lang="pug">
.home-view.page-view(:class="{'single-peer': peers.length < 2}")
  .view-header-container
    .view-header
      .logo-block
        FAHLogo
        ClientVersion(v-if="peers.length == 1", :client="clients['']",
          :latest="latest_version")

      .user-info(v-if="config.user")
        label Folding as
        .user #[a(:href="user_url", target="_blank") {{config.user}}]
        label for team
        .team
          object.team-logo(:data="stats.team_urllogo", type="image/jpeg",
            v-if="config.team")
          a(:href="team_url", target="_blank") {{team_name}}

      .points(v-if="stats.url && !is_anon")
        label Points earned
        .user(title="Total points you've earned.") {{points_earned}}

        label Team points
        .team(title="Points you've contributed to the team.") {{team_points}}

      .actions
        SliderSwitch(v-model="dark_mode", title="Enable dark mode.")
        Button.button-icon(route="/0/settings", title="Settings", icon="cog",
          v-if="peers.length == 1")
        Button.button-icon(route="/0/log", title="Log", icon="list-alt",
          v-if="peers.length == 1")

  .view-body
    .control(v-if="peers.length == 1")
      Button.button-success(v-if="config.paused", @click="fold", icon="play",
        text="Start Folding")
      Button(v-else, @click="pause", text="Pause Folding", icon="pause")

    .control(v-else)
      Button.button-success(text="Start All", @click="fold", icon="play")
      Button(text="Pause All", @click="pause", icon="pause")

    .peers
      h2 Peers

      table
        tr
          th.name Peer
          th Status
          th Version
          th Resources
          th Actions

        template(v-for="(peer, peerID) in peers")
          template(v-for="client in [clients[peer]]")
            PeerRow(:client="client", :peerID="peerID",
              :latest="latest_version")

    .units
      h2 Work Units
      table
        tr
          th.peer Peer
          th.project Project
          th.resources Resources
          th.status Status
          th.eta ETA
          th.progress-cell Progress
          th.actions Actions

        template(v-for="(peer, peerID) in peers")
          template(v-for="client in [clients[peer]]")
            Unit(v-for="unit in client.state.data.units",
              v-if="client.state.data.units", :unit="unit", :client="client",
              :peer="peer", :peerID="peerID")

    ProjectsView(:ids="projects")
    News
</template>

<style lang="stylus">
@import('colors.styl')

.home-view
  .view-header
    > *:first-child, > *:last-child
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

  .control
    display flex
    justify-content center
    gap 0.5em
    text-align center

  .view-body
    > *
      > h2, > h3
        text-align center

  .peer
    .status
      color error-color

    &.connected .status
      color success-color

  .units, .peers
    margin 1em auto
    max-width 60em

    table
      border-collapse collapse

    tr:nth-child(odd)
      background table-odd

    tr:nth-child(even)
      background table-even

    td, th
      text-align left
      border 1px solid border-color
      padding 0.25em 0.5em
      white-space nowrap

    th
      color header-fg
      background header-bg

    .resources
      width 100%

    .actions
      text-align right

      > button
        width 1.3em
        margin 0.125em 0.25em

  &.single-peer
    .peers, .units td.peer, .units th.peer
      display none

  .news-feed, .projects
    margin-top 2em

@media (max-width 800px)
  .units
    td, th
      &.eta, &.resources
        display none
</style>
