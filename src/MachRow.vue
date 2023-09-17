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
import MachineDetailsDialog from './MachineDetailsDialog.vue'


export default {
  name: 'MachRow',
  props: ['mach'],
  components: {MachineDetailsDialog},


  computed: {
    connected() {return this.mach.is_connected()},
    config()    {return this.mach.get_config()},
    info()      {return this.mach.get_info()},


    resources() {
      let l = []

      if (this.config.cpus) l.push('cpu:' + this.config.cpus)

      if (this.config.gpus && this.info.gpus)
        for (let id in this.config.gpus)
          if (this.info.gpus[id] && this.config.gpus[id].enabled)
            l.push(id)

      return l.join(' ')
    }
  },


  methods: {
    show_details() {this.$refs.dialog.exec()}
  }
}
</script>

<template lang="pug">
MachineDetailsDialog(ref="dialog", :info="info")

tr.mach-row(:class="{connected: connected, disconnected: !connected}",
  :title="connected ? undefined : 'Disconnected'")
  td.name(:title="'Machine id ' + mach.get_id()")
    | {{mach.get_name()}}

  td.version
    ClientVersion(:mach="mach")

  td.resources
    template(v-if="config") {{resources}}

  td.actions
    Button.button-icon(:route="mach.get_url('/settings')",
      title="Edit machine settings.", icon="cog", :disabled="!connected")

    Button.button-icon(:route="mach.get_url('/log')",
      title="View machine log.", icon="list-alt", :disabled="!connected")

    Button.button-icon(@click="show_details", icon="info-circle",
      :disabled="!info.version", title="View Machine details.")

    Button.button-icon(v-if="mach.is_paused()", @click="mach.fold()",
      icon="play", title="Start folding on this machine.",
      :disabled="!connected")

    Button.button-icon(v-else, @click="$root.pause([mach])",
      icon="pause", title="Pause folding on this machine.",
      :disabled="!connected")
</template>

<style lang="stylus">
@import('colors.styl')

tr.mach-row.disconnected
  color #666
  background #aaa !important
</style>
