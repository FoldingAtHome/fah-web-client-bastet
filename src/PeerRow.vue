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

export default {
  name: 'PeerRow',
  props: ['client', 'peerID'],

  computed: {
    config() {return this.client.state.data.config},


    gpus() {
      let count = 0

      if (this.config.gpus)
        for (let id in this.config.gpus)
          if (this.config.gpus[id].enabled)
            count++

      return count
    }
  }
}
</script>

<template lang="pug">
tr.peer(:class="{connected: client.connected}")
  td {{client.state.address}}
  td.status {{client.connected ? 'C' : 'Disc'}}onnected
  td
    template(v-if="client.connected") v{{client.version()}}
  td.resources
    template(v-if="config") cpus:{{config.cpus}} gpus:{{gpus}}

  td.actions
    template(v-if="client.connected")
      Button.button-icon(:route="peerID + '/settings'",
        title="Settings", icon="cog")
      Button.button-icon(:route="peerID + '/log'", title="Log",
        icon="list-alt")
      Button.button-icon(v-if="client.paused()", @click="client.fold()",
        icon="play", title="Start folding.")
      Button.button-icon(v-else, @click="$root.pause([client])",
        icon="pause", title="Pause folding.")
</template>

<style lang="stylus">
</style>
