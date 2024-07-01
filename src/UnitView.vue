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
import UnitRow from './UnitRow.vue'


export default {
  props: ['unit', 'mach'],
  components: {UnitRow},


  computed: {
    disabled() {return !this.mach.is_connected()},
    paused()   {return !!this.unit.pause_reason},
    can_dump() {return this.paused && !this.disabled},
    finish()   {return this.mach.get_config(this.unit.group).finish},
  },


  methods: {
    async dump(id) {
      let result = await this.$root.message(
        'confirm', 'Dump Work Unit?',
        'Are you sure you want to dump this Work Unit.  All progress on this ' +
        'Work Unit will be lost and no points will be awarded.')

      if (result == 'ok') this.mach.dump(id)
    },
  }
}
</script>

<template lang="pug">
tr.unit-view
  UnitRow(:data="unit", :columns="$account.get_columns()", :finish="finish")

  td.column-actions
    Button.button-icon(:disabled="!can_dump", @click="dump(unit.id)",
      icon="trash", title="Dump this Work Unit")

    Button.button-icon(v-if="false", :disabled="disabled",
      :route="mach.get_url('/log?q=:WU' + unit.number + ':')",
      icon="list-alt", title="View Work Unit log")

    Button.button-icon(:route="'/unit/' + unit.id",
      icon="info-circle", :disabled="!unit.wu",
      title="View Work Unit details")

    Button.button-icon(
      :route="mach.get_url('/view/' + unit.id)", icon="eye",
      :disabled="!unit.wu || disabled", title="View 3D protein")
</template>

<style lang="stylus">
.unit-view
  td.column-actions
    display flex
    gap 0.5em
    justify-content end
</style>
