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
import util           from './util.js'
import Client         from './client.js'
import PauseDialog    from './PauseDialog.vue'
import LocationDialog from './LocationDialog.vue'
import FoldAnonDialog from './FoldAnonDialog.vue'


export default {
  components: {PauseDialog, LocationDialog, FoldAnonDialog},


  data() {
    return {
      clients: {'': new Client}
    }
  },


  computed: {
    config_available() {
      return this.connected && this.clients[''].state.data.config
    },


    connected() {return this.clients[''].state.connected},


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
            for (let peer of config.peers) try {
              add_peer(util.make_peer_address(peer, address))
            } catch(e) {console.log(e)}
        }
      }

      add_peer('')

      return Object.keys(peers).sort()
    }
  },


  watch: {
    connected(ok) {
      if (ok) util.unlock_scrolling()
      else util.lock_scrolling()
    },


    config_available(ok) {if (ok) this.check_fold_anon()},


    peers(peers) {
      // Add new peers
      for (let address of peers)
        this.add_client(address)

      // Remove deleted peers
      let addrs = Object.keys(this.clients)
      for (let i = 1; i < addrs.length; i++) {
        let address = addrs[i]

        if (peers.indexOf(address) == -1) {
          console.debug('Removing client', address)
          this.clients[address].destroy()
          delete this.clients[address]
        }
      }
    }
  },


  mounted() {util.lock_scrolling()},


  methods: {
    add_client(address) {
      if (!this.clients[address]) {
        console.debug('Adding client', address)
        this.clients[address] = new Client(address)
      }
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
    },


    check_fold_anon() {
      let client = this.clients['']

      if (this.connected && client.waiting_for_config())
        this.$refs.fold_anon_dialog.open(result => {
          switch (result) {
          case 'fold':   client.fold_anon();               break
          case 'config': this.$router.push('/0/settings'); break
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
LocationDialog(ref="location_dialog")
FoldAnonDialog(ref="fold_anon_dialog")

Teleport(to="body")
  .connecting(v-if="!connected"): h2 Connecting...
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

@import('dark.styl')
</style>
