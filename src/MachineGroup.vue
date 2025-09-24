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
export default {
  name: 'MachineGroup',
  emits: ['pause', 'fold'],
  props: {
    group:   String,
    units:   Array,
    mach:    Object,
    columns: Array,
    header:  {default: true}
  },


  computed: {
    connected() {return this.mach.is_connected()},
    failed()    {return this.mach.get_group(this.group).failed},
    warn()      {return 1 < this.mach.get_group(this.group).failed_wus},


    status() {
      let l = []
      if (this.failed) l.push(['Failed', this.failed])
      return l
    },
  },


  methods: {
    async confirm_dump(mach, unit) {
      let response = await this.$root.message(
        'confirm', 'Dump WU?',
        'Dumped Work Units receive no points.  ' +
        'Are you sure you want to dump this Work Unit?',
        [
          {name: 'dump', icon: 'trash', text: 'Dump', class: 'button-caution'},
          {name: 'cancel', icon: 'times'}
        ])

      if (response == 'dump') mach.dump(unit.id)
    },
  }
}
</script>

<template lang="pug">
.machine-group-header(v-if="header",
  :style="{'grid-column': `span ${columns.length + 1}`}",
  :class="{error: !!failed, warn: warn}")
  .group-name.header-subtitle
    | {{group ? `Group ${group}` : 'Default Group'}}

  .group-resources(:title="mach.get_resources(group)")
    | {{mach.get_resources(group, 50)}}

  .group-status
    span(v-for="t in status", :title="t[1]", v-html="t[0]")

  .machine-group-actions
    Button.button-icon(v-if="mach.is_paused(group)", icon="play",
      @click="$emit('fold')", :disabled="!connected",
      title="Start folding in this group")

    Button.button-icon(v-else, @click="$emit('pause')", icon="pause",
      title="Pause folding in this group", :disabled="!connected")

UnitsView(:units="units", :columns="columns", v-slot="{unit}")
  Button.button-icon(:disabled="!unit.paused || !connected",
    @click="confirm_dump(mach, unit)", icon="trash", title="Dump Work Unit")

  Button.button-icon(:disabled="!connected",
    :route="`${mach.get_url('/log')}?q=:WU${unit.number}:`",
    icon="list-alt", title="View Work Unit log")

  Button.button-icon(:route="'/unit/' + unit.id",
    icon="info-circle", :disabled="!unit.wu",
    title="View Work Unit details")

  Button.button-icon(
    :route="mach.get_url('/view/' + unit.id)", icon="eye",
    :disabled="!unit.wu || !connected", title="View 3D protein")
</template>

<style lang="stylus">
.machine-view .machine-group-header
  border-top var(--table-border)
  display flex
  flex-direction row
  gap calc(var(--gap) * 2)
  align-items baseline
  white-space nowrap

  &.error
    border 2px solid var(--error-color) !important

  &.warn
    border 2px solid var(--warn-color) !important

  .group-name
    width 10em
    overflow hidden
    text-overflow ellipsis

  .group-status
    flex 1
    color var(--warn-color)
    font-weight bold
    display flex
    gap var(--gap)
    justify-content end


  .machine-group-actions
    display flex
    flex-direction row
    justify-content end
    gap var(--gap)
</style>
