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
    fieldset.view-panel
      legend Work Unit {{'#' + unit.number}}

      .info-group
        info-item(label="PPD",         :content="ppd")
        info-item(label="Base Credit", :content="credit")

      .info-group
        info-item(label="CPUs", :content="assign.cpus")
        info-item(label="GPUs", :content="gpus")

      .info-group
        .info-item
          label Progress
          span: progress-bar(:progress="progress")

      .info-group
        info-item(label="ETA",      :content="unit.eta")
        info-item(label="Run Time", :content="run_time")

      .info-group
        info-item(label="Assign Time", :content="assign.time")
        info-item(label="Deadline",    :content="deadline")
        info-item(label="Timeout",     :content="timeout")

      .info-group
        info-item(label="Work Server", :content="assign.ws")

      .info-group
        info-item(label="Core", :content="core")

      .info-group
        info-item(label="Project",    :content="assign.project")
        info-item(label="Run",        :content="wu.run")
        info-item(label="Clone",      :content="wu.clone")
        info-item(label="Generation", :content="wu.gen")

    ProjectView(v-if="project", :project="project", :full="true")
</template>

<style lang="stylus">
.unit-details-view
  fieldset.view-body
    margin 0
    display flex
    flex-direction column
    gap 1em
</style>
