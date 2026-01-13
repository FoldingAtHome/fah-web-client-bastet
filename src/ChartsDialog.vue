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
import ChartsView from './ChartsView.vue'

export default {
  props: {charts: {default: []}},
  components: {ChartsView},

  methods: {
    async exec() {return this.$refs.dialog.exec()},
  }
}
</script>

<template lang="pug">
Dialog.charts-dialog(ref="dialog", :buttons="['Ok']", width="90vw",
  height="90vh")
  template(v-slot:header) Team Chart
  template(v-slot:body)
    .chart-controls
      .chart-modes
        label Mode:
        template(v-for="mode in ['PPD', 'Points', 'WUs']")
          input(type="radio", :id="'chart-mode-' + mode", :value="mode",
            v-model="$root.chart_mode")
          label(:for="'chart-mode-' + mode") {{mode}}

      .chart-sources
        label Source:
        template(v-for="source in ['Team', 'User', 'Both']")
          input(type="radio", :id="'chart-source-' + source",
            :value="source", v-model="$root.chart_source")
          label(:for="'chart-source-' + source") {{source}}

    charts-view(ref="chart", :charts="charts", :mode="$root.chart_mode",
      :source="$root.chart_source")
</template>

<style lang="stylus">
.charts-dialog
  max-width  100%
  max-height 100%

  .chart-controls
    display flex
    justify-content space-between
    flex-wrap wrap
    gap 4px

    .chart-modes, .chart-sources
      display flex
      gap 4px

      label
        margin-right 8px
        width 4em

  .charts-view
    width 100%
    height 600px
    max-height 100%
    overflow hidden

  .dialog-body
    display flex
    flex-direction column
</style>
