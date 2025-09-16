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
import TeamChart from './TeamChart.vue'

export default {
  props: {teams: {default: [0]}},
  components: {TeamChart},


  data() {
    return {
      chart_mode: 'PPD'
    }
  },


  watch: {
    chart_mode(mode) {
      this.$refs.chart.set_mode(mode)
      this.$refs.chart.reset()
    },
  },


  methods: {
    async exec() {
      return this.$refs.dialog.exec()
    },


    on_chart_activate(type) {
      if (type == 'dblclick') {
        this.$refs.chart.next_mode()
        this.chart_mode = this.$refs.chart.mode
      }
    }
  }
}
</script>

<template lang="pug">
Dialog.team-chart-dialog(ref="dialog", :buttons="['Ok']", width="90vw",
  height="90vh")
  template(v-slot:header) Team {{chart_mode}} Chart
  template(v-slot:body)
    .chart-modes
      template(v-for="mode in ['Points', 'WUs', 'PPD']")
        input(type="radio", :id="'chart-mode-' + mode", :value="mode",
          v-model="chart_mode")
        label(:for="'chart-mode-' + mode") {{mode}}

    team-chart(ref="chart", :teams="teams", @activate="on_chart_activate")
</template>

<style lang="stylus">
.team-chart-dialog
  max-width  100%
  max-height 100%

  .chart-modes
    display flex
    gap 4px

    label
      margin-right 8px

  .team-chart
    width 100%
    height 600px
    max-height 100%
    overflow hidden

  .dialog-body
    display flex
    flex-direction column
</style>
