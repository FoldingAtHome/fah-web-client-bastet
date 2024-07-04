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


function cmp_wus(a, b) {
  return new Date(b.assignment.time).getTime() -
    new Date(a.assignment.time).getTime()
}


export default {
  name: 'WUsView',
  components: {UnitRow},


  computed: {
    columns() {
      return ['Number', 'Project', 'Progress', 'Status', 'Core',
        'TPF', 'PPD', 'Assign Time']
    },


    wus() {
      let wus = []

      for (let mach of this.$machs) {
        let data = mach.get_data()
        if (data.wus)   wus = wus.concat(data.wus)
        if (data.units) wus = wus.concat(data.units)
      }

      wus = wus.filter((wu) => wu.assignment)

      return wus.sort(cmp_wus)
    },
  },


  mounted() {this.$machs.wus_enable(true)},
  unmounted(to, from) {this.$machs.wus_enable(false)},
}
</script>

<template lang="pug">
.wus-view.page-view.fixed-view
  MainHeader

  .view-body
    .wus
      table.view-table
        tr
          th(v-for="col in columns") {{col}}
          th

        tr(v-for="unit in wus")
          UnitRow(:data="unit", v-if="unit.id", :key="unit.id",
            :columns="columns")

          td
            Button.button-icon(icon="info-circle", :route="'/unit/' + unit.id")
</template>

<style lang="stylus">
.wus-view
  .view-body
    font-family var(--mono-font)

    .wus
      overflow auto
      flex 1

      .view-table
        width 100%

        .button
          font-size 12pt
</style>
