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
import UnitView from './UnitView.vue'

export default {
  name: 'MachView',
  props: ['mach'],
  components: {UnitView},


  computed: {
    one_group() {return this.mach.get_groups().length == 1},
    connected() {return this.mach.is_connected()},
    groups()    {return this.mach.get_groups()},
    info()      {return this.mach.get_info()},
    units()     {return Array.from(this.mach)},
  },


  methods: {
    async pause(group) {
      let state = await this.$root.confirm_pause()

      if (state == 'pause' || state == 'finish')
        this.mach.set_state(state, group)
    },


    async fold(group) {return this.mach.set_state('fold', group)}
  }
}
</script>

<template lang="pug">
.machine-view.view-panel(
  :class="{connected: connected, disconnected: !connected}",
  :title="connected ? undefined : 'Disconnected'")
  .machine-header
    .machine-name.header-title(:title="'F@H ID ' + mach.get_id()")
      | {{mach.get_name()}}

    ClientVersion(:mach="mach")

    .machine-disconnected(v-if="!connected") DISCONNECTED
    .machine-no-wus(v-else-if="!units.length") NO WORK UNITS

    .machine-resources.header-subtitle(v-if="one_group")
      | {{mach.get_resources()}}

    .machine-actions
      Button.button-icon(:route="mach.get_url('/settings')",
        title="Edit machine settings", icon="cog", :disabled="!connected")

      Button.button-icon(:route="mach.get_url('/log')",
        title="View machine log", icon="list-alt", :disabled="!connected")

      Button.button-icon(:route="mach.get_url('/details')", icon="info-circle",
        :disabled="!info.version", title="View Machine details")

      template(v-if="one_group")
        Button.button-icon(v-if="mach.is_paused()", @click="fold",
          icon="play", title="Start folding on this machine",
          :disabled="!connected")

        Button.button-icon(v-else, @click="pause", icon="pause",
        title="Pause folding on this machine", :disabled="!connected")

  table.machine-units.view-table(v-if="units.length || !one_group")
    tr
      th.project Project
      th.cpus CPUs
      th.gpus GPUs
      th.status Status
      th.progress Progress
      th.ppd PPD
      th.eta ETA
      th.actions Actions

    template(v-for="group in groups")
      tr(v-if="!one_group")
        td(colspan="99")
          .machine-group-header
            .group-header
              .group-name(v-if="group") Group {{group}}
              .group-name(v-else) Default Group
              .group-resources.header-subtitle {{mach.get_resources(group)}}

            .machine-actions
              Button.button-icon(v-if="mach.is_paused(group)", icon="play",
                @click="fold(group)", :disabled="!connected",
                title="Start folding in this group")

              Button.button-icon(v-else, @click="pause(group)", icon="pause",
                title="Pause folding in this group", :disabled="!connected")

      template(v-for="unit in units")
        UnitView(v-if="unit.group == group || one_group", :unit="unit",
          :mach="mach")
</template>

<style lang="stylus">
.machine-view
  display flex
  flex-direction column
  gap 0.5em

  &.disconnected
    filter contrast(0.6) brightness(0.4)

  .machine-header, .machine-group-header
    display flex
    flex-direction row
    gap 1em
    align-items baseline
    width 100%

  .machine-disconnected
    font-weight bold
    font-size 150%

  .group-header
    display flex
    flex-direction row
    gap 1em

  .machine-actions
    flex 1
    display flex
    gap 0.5em
    flex-direction row
    justify-content end

@media (max-width 800px)
  .machine-view .group-resources
    display none

  .machine-units
    td, th
      &.eta, &.cpus, &.gpus, &.ppd, .status-text
        display none
</style>
