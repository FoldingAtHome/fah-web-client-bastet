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
function addTime(t, offset) {
  t = new Date(t)
  t.setSeconds(t.getSeconds() + offset)
  return t.toISOString().replace(/\.\d+Z/, 'Z')
}


export default {
  props: ['mach', 'unitID'],


  computed: {
    unit()     {return this.mach.get_unit(this.unitID) || {}},
    assign()   {return this.unit.assignment || {}},
    core()     {return this.assign.core.type},
    timeout()  {return addTime(this.assign.time, this.assign.timeout)},
    deadline() {return addTime(this.assign.time, this.assign.deadline)},
    cs()       {return (this.unit.wu.cs || []).join(', ')},
  }
}
</script>

<template lang="pug">
.unit-details-view.page-view
  ViewHeader(title="Work Unit Details")

  .view-body
    table.view-table(v-if="unit.wu")
      tr
        th Project
        td {{assign.project}}

      tr
        th Run
        td {{unit.wu.run}}

      tr
        th Clone
        td {{unit.wu.clone}}

      tr
        th Generation
        td {{unit.wu.gen}}

      tr
        th Core
        td {{core}}

      tr
        th Progress
        td {{(unit.progress * 100).toFixed(1)}}%

      tr
        th ETA
        td {{unit.eta}}

      tr
        th Runtime
        td {{unit.run_time.toLocaleString()}}s

      tr
        th Base Credit
        td {{assign.credit.toLocaleString()}}

      tr
        th PPD
        td {{unit.ppd.toLocaleString()}}

      tr
        th CPUs
        td {{assign.cpus}}

      tr
        th GPUs
        td {{assign.gpus ? assign.gpus.join(' ') : ''}}

      tr
        th Deadline
        td {{deadline}}

      tr
        th Timeout
        td {{timeout}}

      tr
        th Work Server
        td {{assign.ws}}

      tr
        th Collection Servers
        td {{cs}}

      tr
        th Assign Time
        td {{assign.time}}
</template>

<style lang="stylus">
.unit-details-view
  table.view-table
    td, th
      white-space normal
</style>
