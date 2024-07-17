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
  props: ['unitID'],


  computed: {
    unit() {return new Unit(this.$ctx, this.$machs.get_unit(this.unitID))},
    project() {return this.$projects.get(this.unit.project) || {}},
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
        info-item(label="PPD",         :content="unit.ppd")
        info-item(label="Base Credit", :content="unit.credit")

      .info-group
        info-item(label="CPUs", :content="unit.cpus_description")
        info-item(label="GPUs", :content="unit.gpus_description")

      .info-group
        .info-item
          label Progress
          span: ProgressBar(:progress="unit.progress")

      .info-group
        info-item(label="ETA",      :content="unit.eta")
        info-item(label="Run Time", :content="unit.run_time")

      .info-group
        info-item(label="Assign Time", :content="unit.assign_time",
          :title="unit.assign_time_title")
        info-item(label="Deadline",    :content="'in ' + unit.deadline",
          :title="unit.deadline_time")
        info-item(label="Timeout",     :content="'in ' + unit.timeout",
          :title="unit.timeout_time")

      .info-group
        info-item(label="Work Server", :content="unit.assign.ws")

      .info-group
        info-item(label="Core", :content="unit.core")

      .info-group
        info-item(label="Project",    :content="unit.project")
        info-item(label="Run",        :content="unit.wu.run")
        info-item(label="Clone",      :content="unit.wu.clone")
        info-item(label="Generation", :content="unit.wu.gen")

    ProjectView(v-if="project.description", :project="project", :full="true")
</template>

<style lang="stylus">
</style>
