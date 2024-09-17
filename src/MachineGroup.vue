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
  }
}
</script>

<template lang="pug">
.machine-group-header(v-if="header",
  :style="{'grid-column': `span ${columns.length + 1}`}")
  .group-name.header-subtitle
    | {{group ? `Group ${group}` : 'Default Group'}}

  .group-resources(:title="mach.get_resources(group)")
    | {{mach.get_resources(group, 50)}}

  .machine-group-actions
    Button.button-icon(v-if="mach.is_paused(group)", icon="play",
      @click="$emit('fold')", :disabled="!connected",
      title="Start folding in this group")

    Button.button-icon(v-else, @click="$emit('pause')", icon="pause",
      title="Pause folding in this group", :disabled="!connected")

UnitsView(:units="units", :columns="columns", v-slot="{unit}")
  Button.button-icon(:disabled="!unit.paused || !connected",
    @click="mach.dump(unit.id)",
    icon="trash", title="Dump this Work Unit")

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

  .group-name
    width 10em
    overflow hidden
    text-overflow ellipsis

  .machine-group-actions
    flex 1
    display flex
    flex-direction row
    justify-content end
    gap var(--gap)
</style>
