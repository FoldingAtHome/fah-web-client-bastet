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
  props: ['unitID'],


  data() {
    return {
      loading: true,
      credits: []
    }
  },


  computed: {
    unit() {return this.$machs.get_unit(this.unitID)},
    project() {return this.$projects.get(this.unit.project) || {}},
  },


  watch: {
    'unit.project'() {this.load_credits()}
  },


  mounted() {this.load_credits()},


  methods: {
    async load_credits() {
      let u = this.unit
      if (!u || !u.project) return
      let path =
        `/project/${u.project}/run/${u.run}/clone/${u.clone}/gen/${u.gen}`
      this.credits = await this.$api.fetch({
        path, expire: 10 * 60 * 1000,
        action: 'Loading Work Unit logged credits'
      })
      this.loading = false
    }
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
        info-item(label="Base Credit", :content="unit.base_credit")

      .info-group
        info-item(label="CPUs", :content="unit.cpus_description")
        info-item(label="GPUs", :content="unit.gpus_description")

      .info-group
        .info-item
          label Progress
          span: ProgressBar(:progress="unit.progress")

      .info-group
        info-item(label="TPF",      :content="unit.tpf")
        info-item(label="ETA",      :content="unit.eta")
        info-item(label="Run Time", :content="unit.run_time")

      .info-group
        info-item(label="Assign Time", :content="unit.assign_time",
          :title="unit.assign_time_title")
        info-item(label="Deadline in", :content="unit.deadline",
          :title="unit.deadline_time")
        info-item(label="Timeout in",  :content="unit.timeout",
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

    fieldset.view-panel
      legend Logged Credits

      div(v-if="loading") Loading...
      div(v-else-if="!credits.length") No credits logged
      template(v-else)
        table.view-table
          tr
            th Code
            th User
            th Team
            th Credit
            th Assigned
            th Credited

          tr(v-for="credit in credits")
            td.code {{credit.code}}
            td.user {{credit.user}}
            td.team {{credit.team}}
            td.credit {{(credit.credit || 0).toLocaleString()}}
            td.assigned {{credit.assign_time}}
            td.credited {{credit.credit_time}}

        p May included credits awarded to other users.

    ProjectView(v-if="project.description", :project="project", :full="true")
</template>

<style lang="stylus">
.unit-details-view
  .view-table
    .user
      max-width 20em
      overflow hidden
      text-overflow ellipsis
</style>
