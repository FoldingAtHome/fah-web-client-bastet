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
import Unit from './unit.js'


export default {
  props: {
    data: {},
    columns: Array,
    finish: false
  },


  data() {
    return {unit: new Unit(this.$ctx, this.data)}
  },


  methods: {
    klass(col) {return 'column-' + col.toLowerCase().replace(' ', '-')}
  }
}
</script>

<template lang="pug">
template(v-for="col in columns")
  td(:class="klass(col)", v-if="col == 'Project'") {{unit.project}}
  td(:class="klass(col)", v-if="col == 'CPUs'") {{unit.cpus}}
  td(:class="klass(col)", v-if="col == 'GPUs'") {{unit.gpus}}

  td(:class="klass(col) + ' state-' + unit.state.toLowerCase()",
    v-if="col == 'Status'", :title="unit.status")
    .fa(:class="'fa-' + unit.icon")

  td(:class="klass(col) + ' state-' + unit.state.toLowerCase()",
    v-if="col == 'Status Text'") {{unit.status}}

  td(:class="klass(col)", v-if="col == 'Progress'", :title="'ETA ' + unit.eta")
    ProgressBar(:progress="unit.progress")

  td(:class="klass(col)", v-if="col == 'Core'", title="Core type") {{unit.core}}

  td(:class="klass(col)", v-if="col == 'PPD'",
    title="Estimated Points Per Day") {{unit.ppd}}

  td(:class="klass(col)", v-if="col == 'TPF'", title="Time Per Frame")
    | {{unit.tpf}}

  td(:class="klass(col)", v-if="col == 'ETA'",
    title="Estimated time to Work Unit completion") {{unit.eta}}

  td(:class="klass(col)", v-if="col == 'Deadline'",
    :title="'Time until return deadline at ' + unit.deadline_time")
    | {{unit.deadline}}

  td(:class="klass(col)", v-if="col == 'Timeout'",
    :title="'Time until bonus timeout at ' + unit.timeout_time")
    | {{unit.timeout}}

  td(:class="klass(col)", v-if="col == 'RCG'", title="Run Clone Gen")
    | {{unit.rcg}}

  td(:class="klass(col)", v-if="col == 'Run Time'",
    title="Total Work Unit run time") {{unit.run_time}}

  td(:class="klass(col)", v-if="col == 'Base Credit'",
    title="Work Unit base credit") {{unit.credit}}

  td(:class="klass(col)", v-if="col == 'Assign Time'",
    title="Work Unit assignment time in UTC") {{unit.assign_time}}

  td(:class="klass(col)", v-if="col == 'Number'",
    title="Work Unit number assigned by the machine it's on") {{unit.number}}
</template>

<style lang="stylus">
.unit-view
  td
    font-family var(--mono-font)
    text-align left

td.column-status
  text-align center

  &.state-run, &.state-finish
    .fa
      color green

  &.state-clean .fa
    color gold

  &.state-pause .fa
    color #e8cf01

  &.state-finish .fa
    color orange
</style>
