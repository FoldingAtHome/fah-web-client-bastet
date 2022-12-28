<script>
import util        from './util.js'
import Client      from './client.js'
import PauseDialog from './PauseDialog.vue'


export default {
  components: {PauseDialog},


  data() {
    return {
      clients: {'': new Client}
    }
  },


  computed: {
    peers() {
      let peers   = {}
      let clients = this.clients

      function add_peer(address) {
        if (peers[address]) return
        peers[address] = true

        let client = clients[address]
        if (client) {
          if (client.state.path) return // Not a root client

          let config = client.state.data.config
          if (config)
            for (let peer of config.peers)
              add_peer(util.make_peer_address(peer, address))
        }
      }

      add_peer('')

      return Object.keys(peers).sort()
    }
  },


  watch: {
    peers(peers) {
      // Add new peers
      for (let address of peers)
        this.add_client(address)

      // Remove deleted peers
      for (let i = 1; i < this.clients.length;) {
        let client = this.clients[i]

        if (peers.indexOf(client.state.address) == -1) {
          client.destroy()
          this.clients.splice(i, 1)

        } else i++
      }
    }
  },


  methods: {
    add_client(address) {
      if (!this.clients[address])
        this.clients[address] = new Client(address)
    },


    pause(clients) {
      let active = []

      for (let client of clients) {
        if (client.is_active()) active.push(client)
        else client.pause()
      }

      if (active.length)
        this.$refs.pause_dialog.open(result => {
          for (let client of active)
            switch (result) {
            case 'pause':  client.pause();  break
            case 'finish': client.finish(); break
            }
        })
    }
  }
}
</script>

<template lang="pug">
main
  router-view(v-slot="{Component}")
    keep-alive(include="HomeView")
      component(:is="Component", :peers="peers", :clients="clients")

PauseDialog(ref="pause_dialog")

Teleport(to="body")
  .connecting(v-if="!clients[''].state.connected"): h2 Connecting...
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
