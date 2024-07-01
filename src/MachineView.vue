<!--

                  This file is part of the Folding@home Client.

          The fah-client runs Folding@home protein folding simulations.
                    Copyright (c) 2001-2024, foldingathome.org
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
    loading()   {return !this.connected && this.$node.is_loading()},
    one_group() {return this.mach.get_groups().length == 1},
    connected() {return this.mach.is_connected()},
    groups()    {return this.mach.get_groups()},
    info()      {return this.mach.get_info()},
    version()   {return this.info.version},
    units()     {return Array.from(this.mach)},


    outdated()  {
      return this.version && this.$util.version_less(this.version, '8.3.0')
    },


    web_control() {
      if (this.version && this.$util.version_less(this.version, '8.2.0'))
        return 'https://v8-1.foldingathome.org/'
    }
  },


  methods: {
    async pause(group) {
      let state = await this.$root.confirm_pause()

      if (state == 'pause' || state == 'finish')
        this.mach.set_state(state, group)
    },


    async fold(group) {return this.mach.set_state('fold', group)},
  }
}
</script>

<template lang="pug">
.machine-view.view-panel(
  :class="{connected: connected, disconnected: !connected}",
  :title="connected ? undefined : 'Disconnected'")
  .machine-header
    .machine-name.header-title(:title="mach.get_title()")
      .fa.fa-dot-circle-o(v-if="mach.is_direct()")
      | {{mach.get_name()}}

    ClientVersion(:mach="mach")

    .machine-status(v-if="loading") Loading...
    .machine-status(v-else-if="!connected") DISCONNECTED
    .machine-status(v-else-if="outdated") UPGRADE REQUIRED
    .machine-status(v-else-if="!units.length") NO WORK UNITS

    a(v-if="web_control", :href="web_control")
      | Old Web Control #[.fa.fa-arrow-right]

    .machine-resources.header-subtitle(
      v-if="one_group && !outdated", :title="mach.get_resources()")
      | {{mach.get_resources('', 50)}}

    .machine-actions(v-if="!outdated")
      Button.button-icon(:route="mach.get_url('/settings')",
        title="Edit machine settings", icon="cog", :disabled="!mach.get_id()")

      Button.button-icon(:route="mach.get_url('/log')",
        title="View machine log", icon="list-alt", :disabled="!connected")

      Button.button-icon(:route="mach.get_url('/details')",
        icon="info-circle", :disabled="!version",
        title="View Machine details")

      template(v-if="one_group")
        Button.button-icon(v-if="mach.is_paused()", @click="fold()",
          icon="play", title="Start folding on this machine",
            :disabled="!connected")

        Button.button-icon(v-else, @click="pause()", icon="pause",
          title="Pause folding on this machine",
          :disabled="!connected")

  .machine-units(v-if="connected && !outdated")
    table.view-table
      tr
        th(v-for="col in $account.get_columns()",
          :class="'column-' + col.toLowerCase()") {{col}}
        th.column-actions Actions

      template(v-for="group in groups")
        tr(v-if="!one_group")
          td(colspan="99")
            .machine-group-header
              .group-header
                .group-name(v-if="group") Group {{group}}
                .group-name(v-else) Default Group
                .group-resources.header-subtitle(
                  :title="mach.get_resources(group)")
                  | {{mach.get_resources(group, 50)}}

              .machine-group-actions
                Button.button-icon(v-if="mach.is_paused(group)", icon="play",
                  @click="fold(group)", :disabled="!connected",
                  title="Start folding in this group")

                Button.button-icon(v-else, @click="pause(group)", icon="pause",
                  title="Pause folding in this group", :disabled="!connected")

        template(v-for="unit in units", :key="unit.number")
          UnitView(v-if="unit.group == group || one_group", :unit="unit",
            :mach="mach")
</template>

<style lang="stylus">
.machine-view
  display flex
  flex-direction column
  gap 0.5em

  &.disconnected
    filter contrast(0.6) brightness(0.5)

  .machine-header, .machine-group-header
    display flex
    flex-direction row
    gap 1em
    align-items baseline
    width 100%
    white-space normal

  .machine-name .fa
    margin 0.5em
    font-size 70%

  .machine-status
    font-weight bold
    font-size 120%

  .group-header
    display flex
    flex-direction row
    gap 1em

  .machine-units
    width 100%
    overflow-x auto

    > .view-table
      width 100%

      .column-progress
        width 100%

      .column-actions
        text-align right

  .machine-actions, .machine-group-actions
    flex 1
    display flex
    flex-direction row
    justify-content end
    gap 0.5em

  .machine-actions
    margin-right 8px

@media (max-width 800px)
  .machine-view
    .machine-units
      td, th
        .status-text
          display none
</style>
