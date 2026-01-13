<!--

                  This file is part of the Folding@home Client.

          The fah-client runs Folding@home protein folding simulations.
                    Copyright (c) 2001-2026, foldingathome.org
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
import MachineGroup from './MachineGroup.vue'
import Unit         from './unit.js'


export default {
  name: 'MachineView',
  props: ['mach'],
  components: {MachineGroup},


  computed: {
    loading()   {return !this.connected && this.$node.is_loading()},
    title()     {if (!this.connected) return 'Disconnected'},
    one_group() {return this.mach.get_groups().length == 1},
    connected() {return this.mach.is_connected()},
    groups()    {return this.mach.get_groups()},
    info()      {return this.mach.get_info()},
    version()   {return this.info.version},
    units()     {return this.mach.get_units()},
    no_work()   {return !this.units.length},


    show_units() {
      return this.connected && !this.outdated &&
        (!this.no_work || !this.one_group)
    },


    failed() {return this.one_group && this.mach.get_group().failed},
    warn() {return this.one_group && 1 < this.mach.get_group().failed_wus},


    status() {
      let l = []

      if (this.loading) l.push(['Loading...'])
      else if (!this.connected) l.push(['Disconnected'])
      else {
        if (this.outdated) l.push(['Outdated', 'Client version too old'])
        if (this.unlinked)
          l.push(['Unlinked', 'Machine not linked to F@H account'])
        if (this.no_work)  l.push(['No work', 'Start folding to download work'])
      }
      if (this.failed) l.push(['Failed',  this.failed])
      if (this.warn)   l.push(['Warning', 'Check log for errors and warnings'])

      return l
    },


    columns() {return this.$account.get_columns()},


    klass() {
      return (this.connected ? '' : 'disconnected') +
        (this.show_units ? '' : ' empty') +
        (this.failed ? ' error' : '') + (this.warn ? ' warn' : '')
    },


    unit_style() {return Unit.get_column_grid_style(this.columns, ' 1fr')},


    outdated()  {
      return this.version && this.$util.version_less(this.version, '8.3.0')
    },


    unlinked() {
      let aid = this.mach.get_info().account
      return this.$adata.id ? aid != this.$adata.id : !aid
    }
  },


  methods: {
    async pause(group) {
      let state = await this.$root.confirm_pause()

      if (state == 'pause' || state == 'finish' || state == 'fold')
        this.mach.set_state(state, group)
    },


    async fold(group) {return this.mach.set_state('fold', group)},
  }
}
</script>

<template lang="pug">
.machine-view.view-panel(:class="klass", :title="title")
  .machine-header
    .machine-name.header-title(:title="mach.get_title()")
      | {{mach.get_name()}}
      .fa.fa-dot-circle-o(v-if="mach.is_direct()")

    ClientVersion.machine-version(:mach="mach")

    .machine-resources(v-if="one_group && !outdated",
      :title="mach.get_resources()") {{mach.get_resources('', 50)}}

    .machine-status
      span(v-for="t in status", :title="t[1]", v-html="t[0]")

    .machine-actions(v-if="!outdated")
      Button.button-icon(:route="mach.get_url('/settings')",
        title="Edit machine settings", icon="cog", :disabled="!mach.get_id()")

      Button.button-icon(:route="mach.get_url('/log')",
        title="View machine log", icon="list-alt", :disabled="!connected")

      Button.button-icon(:route="mach.get_url('/details')",
        icon="info-circle", :disabled="!version",
        title="View Machine details")

      Button.button-icon(v-if="mach.is_paused()", @click="fold()",
        icon="play", title="Start folding on this machine",
          :disabled="!connected")

      Button.button-icon(v-else, @click="pause()", icon="pause",
        title="Pause folding on this machine",
        :disabled="!connected")

  .units-view(:style="unit_style", v-if="show_units")
    UnitHeaders(v-if="!no_work", :columns="columns") Actions

    template(v-for="group in groups")
      MachineGroup(:group="group", :mach="mach", :columns="columns",
        :units="units.filter(unit => unit.group == group || one_group)",
        :header="!one_group", @fold="fold(group)", @pause="pause(group)")
</template>

<style lang="stylus">
.machine-view
  padding calc(var(--gap) / 1) 0
  overflow hidden
  display flex
  flex-direction column
  gap calc(var(--gap) / 2)

  &.error
    border 2px solid var(--error-color) !important

  &.warn
    border 2px solid var(--warn-color) !important

  &.disconnected
    filter contrast(0.6) brightness(0.5)

  &:not(.empty)
    padding-bottom 0

  .machine-header
    display flex
    flex-direction row
    align-items baseline
    white-space nowrap
    padding 0 var(--gap)
    gap calc(var(--gap) * 2)

    .machine-name
      width 8em
      min-width 4em
      overflow hidden
      text-overflow ellipsis

      .fa
        margin calc(var(--gap) / 2)
        font-size 70%

    .machine-version
      width 3em

    .machine-status
      flex 1
      color var(--warn-color)
      font-weight bold
      display flex
      gap var(--gap)
      justify-content end

    .machine-actions
      display flex
      flex-direction row
      justify-content end
      gap var(--gap)

  .units-view
    width 100%
    overflow-x auto
</style>
