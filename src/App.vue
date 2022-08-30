<script>
import Client from './client.js'
import util from './util.js'


export default {
  data() {
    return {
      peers: []
    }
  },


  computed: {
    data() {return this.peers.length ? this.peers[0].state.data : {}}
  },


  watch: {
    'data.config.peers'() {
      for (let address of this.data.config.peers) {
        let exists = false

        for (let peer of this.peers)
          if (peer.state.address == address) exists = true

        if (!exists) this.add_peer(address)
      }
    }
  },


  created() {this.add_peer()},


  methods: {
    add_peer(address) {this.peers.push(new Client(address))}
  }
}
</script>

<template lang="pug">
main
  router-view(:peers="peers", v-slot="{Component}")
    keep-alive(include="HomeView")
      component(:is="Component")

Teleport(to="body")
  .connecting(v-if="!peers[0].state.connected"): h2 Connecting...
</template>

<style lang="stylus">
@import('colors.styl')

*
  box-sizing border-box

.fa
  font-size 130%
  vertical-align middle

a
  text-decoration none

  &:visited, &:link
    color link-color

  &:hover
    text-decoration underline

a.fa
  &:visited, &:link
    text-decoration none
    color black

  &:hover
    text-decoration none

.connecting
  top 0
  left 0
  position absolute
  width 100vw
  height 100vh
  background overlay-bg
  display flex
  justify-content center
  align-items center
  z-index 1000

  > *
    color overlay-fg
    font-size 250%

body
  margin 0
  width 100%
  background body-bg
  padding-left calc(100vw - 100%)

  #app
    display flex
    flex-direction column
    width 100%

.page-view
  .view-header-container
    color header-fg
    background header-bg
    min-height 8em
    margin-left calc(100% - 100vw)
    padding-left calc(100vw - 100%)

    .view-header
      padding 1em 0
      display flex
      flex-diretion column
      flex-wrap wrap
      gap 4em
      align-items flex-start
      max-width 60em
      margin auto

      a:visited, a:link
        color header-fg

      a:hover
        text-decoration none
        color link-color

      button, h1, h2
        margin 0

      .actions
        display flex
        gap 0.25em
        flex-direction column
        align-items end
        font-size 150%

        .fa:not(:hover)
          color header-fg

  .view-body
    margin auto
    max-width 60em
    padding 1em 0
</style>
