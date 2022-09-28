<script>
import Unit    from './Unit.vue'
import News    from './News.vue'
import util    from './util.js'
import Cookie  from './cookie.js'


const team_url = 'https://stats.foldingathome.org/team/'
const user_url ='https://stats.foldingathome.org/donor/'


export default {
  name: 'HomeView',
  props: ['peers'],
  components: {Unit, News},

  data() {
    return {
      pause_dialog_buttons: [
        {name: 'pause', text: 'Pause now', icon: 'pause'},
        {name: 'finish', text: 'Finish up, then pause', icon: 'clock-o'}
      ],

      util
    }
  },


  computed: {
    data()   {return this.peers[0].state.data},
    config() {return this.data.config || {}},
    stats()  {return this.peers[0].state.stats || {}},

    user_url()  {return user_url + this.config.user},
    team_url()  {return team_url + this.config.team},
    team_name() {return this.stats.team_name || this.config.team}
  },


  methods: {
    fold() {for (let peer of this.peers) peer.fold()},


    pause_dialog(peer) {
      this.$refs.pause_dialog.open(result => {
        let peers = peer ? [peer] : this.peers

        for (let peer of peers)
          switch (result) {
          case 'pause':  return peer.pause()
          case 'finish': return peer.finish()
          }
      })
    }
  }
}
</script>

<template lang="pug">
Dialog(:buttons="pause_dialog_buttons", ref="pause_dialog")
  template(v-slot:header) Pause or Finnish
  template(v-slot:body).
    Would you like to pause folding now or finish all the active work units
    then pause?

.home-view.page-view
  .view-header-container
    .view-header
      FAHLogo

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

      .actions
        Button.button-icon(route="settings", title="Settings", icon="cog")
        Button.button-icon(route="log", title="Log", icon="list-alt")

  .view-body
    .control
      Button.button-success(v-if="config.paused", @click="fold()",
        text="Start Folding", icon="play")
      Button(v-else, @click="pause_dialog()", text="Pause Folding",
        icon="pause")

    table.units(:class="{'single-peer': peers.length < 2}")
      tr
        th.peer Peer
        th Project
        th Unit
        th Resources
        th Status
        th ETA
        th Progress
        th Actions

      template(v-for="peer in peers")
        tr.peer(:class="{connected: peer.connected}")
          td(colspan="7").
            {{peer.state.address}}
            #[span.status {{peer.connected ? 'C' : 'Disc'}}onnected]
          td.actions
            Button.button-icon(route="settings", title="Settings", icon="cog")
            Button.button-icon(route="log", title="Log", icon="list-alt")
            Button.button-icon(v-if="peer.paused()", @click="peer.fold()",
              icon="play", title="Start folding.")
            Button.button-icon(v-else, @click="pause_dialog(peer)",
              icon="pause", title="Pause folding.")

        Unit(v-for="unit in peer.state.data.units",
          v-if="peer.state.data.units", :unit="unit", :peer="peer")

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
    text-align center

  .peer
    td
      background #888

      .status
        color error-color

    &.connected td
      background #fff

      .status
        color success-color

  .units
    margin 1em auto
    border-collapse collapse
    max-width 60em

    &.single-peer
      tr.peer, td.peer, th.peer
        display none

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

    .actions
      > *
        width 1.3em

  .news-feed
    margin-top 4em
</style>
