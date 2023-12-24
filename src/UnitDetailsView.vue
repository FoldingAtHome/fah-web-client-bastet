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
    wu()       {return this.unit.wu || {}},
    assign()   {return this.unit.assignment || {}},
    core()     {return (this.assign.core || {}).type},
    timeout()  {return addTime(this.assign.time, this.assign.timeout)},
    deadline() {return addTime(this.assign.time, this.assign.deadline)},
    cs()       {return (this.wu.cs || []).join(', ')},
    progress() {return ((this.unit.progress || 0) * 100).toFixed(1)},
    run_time() {return (this.unit.run_time || 0).toLocaleString() + 's'},
    credit()   {return (this.assign.credit || 0).toLocaleString()},
    ppd()      {return (this.unit.ppd || 0).toLocaleString()},
    gpus()     {return this.assign.gpus ? this.assign.gpus.join(' ') : 'None'},
    project()  {return this.$projects.get(this.assign.project)},
  }
}
</script>

<template lang="pug">
.unit-details-view.page-view
  ViewHeader(title="Work Unit Details")

  .view-body(v-if="unit.wu")
    .info-group
      .info-item
        label PPD
        span {{ppd}}

      .info-item
        label Base Credit
        span {{credit}}

    .info-group
      .info-item
        label CPUs
        span {{assign.cpus}}

      .info-item
        label GPUs
        span {{gpus}}

    .info-group
      .info-item
        label Progress
        span: progress-bar(:progress="progress")

    .info-group
      .info-item
        label ETA
        span {{unit.eta}}

      .info-item
        label Run Time
        span {{run_time}}

    .info-group
      .info-item
        label Assign Time
        span {{assign.time}}

      .info-item
        label Deadline
        span {{deadline}}

      .info-item
        label Timeout
        span {{timeout}}

    .info-group
      .info-item
        label Work Server
        span {{assign.ws}}

    .info-group
      .info-item
        label Core
        span {{core}}

    .info-group
      .info-item
        label Run
        span {{wu.run}}

      .info-item
        label Clone
        span {{wu.clone}}

      .info-item
        label Generation
        span {{wu.gen}}

    ProjectView(v-if="project", :project="project", :full="true")
</template>

<style lang="stylus">
.unit-details-view
  .view-body
    display flex
    flex-direction column
    gap 1em
</style>
