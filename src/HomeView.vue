<script>
import PeerRow     from './PeerRow.vue'
import Unit        from './Unit.vue'
import ProjectView from './ProjectView.vue'
import News        from './News.vue'
import util        from './util.js'
import Cookie      from './cookie.js'


const team_url = 'https://stats.foldingathome.org/team/'
const user_url = 'https://stats.foldingathome.org/donor/'


export default {
  name: 'HomeView',
  props: ['clients', 'peers'],
  components: {PeerRow, Unit, News, ProjectView},

  data() {
    return {
      util
    }
  },


  computed: {
    data()   {return this.clients[''].state.data},
    config() {return this.data.config || {}},
    stats()  {return this.clients[''].state.stats || {}},

    user_url()  {return user_url + this.config.user},
    team_url()  {return team_url + this.config.team},
    team_name() {return this.stats.team_name || this.config.team},


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


  methods: {
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
        .client-version(v-if="peers.length == 1",
          :title="'Folding@home client version ' + clients[''].version()")
          | v{{clients[''].version()}}

      .user-info(v-if="config.user")
        label Folding as
        .user #[a(:href="user_url", target="_blank") {{config.user}}]
        label for team
        .team
          object.team-logo(:data="stats.team_urllogo", type="image/jpeg")
          a(:href="team_url", target="_blank") {{team_name}}

      .points(v-if="stats.url")
        label Points earned
        .user(title="Total points you've earned.").
          {{stats.earned.toLocaleString()}}

        label Team points
        .team(title="Points you've contributed to the team.").
          {{util.human_number(stats.contributed)}} of
          {{util.human_number(stats.team_total)}}

      .actions(v-if="peers.length == 1")
        Button.button-icon(route="/0/settings", title="Settings", icon="cog")
        Button.button-icon(route="/0/log", title="Log", icon="list-alt")

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
            PeerRow(:client="client", :peerID="peerID")

    .units
      h2 Work Units
      table
        tr
          th.peer Peer
          th Project
          th Unit
          th.resources Resources
          th Status
          th ETA
          th Progress
          th Actions

        template(v-for="(peer, peerID) in peers")
          template(v-for="client in [clients[peer]]")
            Unit(v-for="unit in client.state.data.units",
              v-if="client.state.data.units", :unit="unit", :client="client",
              :peer="peer", :peerID="peerID")

    .projects(v-if="projects.length")
      h2 Projects
      ProjectView(v-for="id in projects", :id="id")

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
</style>
