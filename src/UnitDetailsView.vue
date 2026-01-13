<!--

                  This file is part of the Folding@home Client.

          The fah-client runs Folding@home protein folding simulations.
                    Copyright (c) 2001-2026, foldingathome.org
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
      legend(:title="`Unit ID ${unit.id}`") Work Unit {{'#' + unit.number}}

      .info-group
        unit-info(:unit="unit", field="Status Text")
        unit-info(:unit="unit", field="Progress")

      .info-group
        unit-info(:unit="unit", field="Machine")
        unit-info(:unit="unit", field="OS Text")

      .info-group
        unit-info(:unit="unit", field="TPF")
        unit-info(:unit="unit", field="PPD")

      .info-group
        unit-info(:unit="unit", field="CPUs")
        unit-info(:unit="unit", field="GPUs Text")

      .info-group
        unit-info(:unit="unit", field="Run Time")
        unit-info(:unit="unit", field="ETA")

      .info-group
        unit-info(:unit="unit", field="Assign Time")
        unit-info(:unit="unit", field="Base Credit")

      .info-group
        unit-info(:unit="unit", field="Deadline")
        unit-info(:unit="unit", field="Timeout")

      .info-group
        unit-info(:unit="unit", field="Core")
        unit-info(:unit="unit", field="Work Server")

      .info-group
        unit-info(:unit="unit", field="Project")
        unit-info(:unit="unit", field="RCG")

    fieldset.view-panel
      legend Logged Credits

      div(v-if="loading") Loading...
      div(v-else-if="!credits.length") No credits logged
      template(v-else)
        table.view-table
          thead
            tr
              th Code
              th User
              th Team
              th Credit
              th Assigned
              th Credited

          tbody
            tr(v-for="credit in credits")
              td.code {{credit.code}}
              td.user {{credit.user}}
              td.team {{credit.team}}
              td.credit {{(credit.credit || 0).toLocaleString()}}
              td.assigned {{credit.assign_time}}
              td.credited {{credit.credit_time}}

        p May include credits awarded to other users.

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
