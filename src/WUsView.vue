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
import Unit    from './unit.js'

function cmp(a, b, config) {
  [a, b] = [a[config.key], b[config.key]]

  let x = 0
  if (config.key == 'time') x = new Date(a).getTime() - new Date(b).getTime()
  else if (typeof a == 'string') x = a.localeCompare(b)
  else x = a - b

  return config.dir * x
}


function cmp_wus(a, b) {
  return new Date(b.assign.time).getTime() - new Date(a.assign.time).getTime()
}


export default {
  name: 'WUsView',


  data() {
    return {
      avg: {key: 'time', dir:  -1},
      hst: {key: 'time', dir:  -1},
    }
  },


  computed: {
    avg_columns() {
      return [
        {name: 'Project', title: 'Folding project ID', key: 'project'},
        {name: 'Core', title: 'Folding core ID', key: 'core'},
        {name: 'Resources', title: 'Compute resources used', key: 'resources'},
        {name: 'TPF', title: 'Average Time Per Frame', key: 'tpf'},
        {name: 'PPD', title: 'Average Points Per Day', key: 'ppd'},
        {name: 'Units', title: 'Total Work Units including partials',
          key: 'progress'},
        {name: 'Last Assigned', title: 'Last time this WU was assigned',
          key: 'time'},
      ]
    },


    columns() {
      return ['Machine', 'Project', 'Core', 'Status', 'Progress',
        'TPF', 'PPD', 'Assign Time']
    },


    Unit() {return Unit},
    wus() {return Array.from(this.$machs.get_units()).sort(cmp_wus)},


    performance() {
      let r = {}

      for (let unit of this.wus) {
        let progress = unit.wu_progress
        if (!isFinite(progress)) continue

        let time = new Date(unit.assign.time).getTime()
        let desc = unit.description

        let d = r[desc]
        if (d) {
          if (d.time < time) d.time = time
          d.tpf      += unit.tpf_secs * progress
          d.ppd      += (unit.unit.ppd || 0) * progress
          d.run_time += unit.run_time_secs || 0
          d.progress += progress

        } else
          r[desc] = {
            id:        desc,
            project:   unit.project,
            core:      unit.core,
            resources: unit.resources,
            cpus:      unit.cpus,
            gpus:      unit.unit.gpus,
            tpf:       unit.tpf_secs * progress,
            ppd:       (unit.unit.pdd || 0) * progress,
            run_time:  unit.run_time_secs || 0,
            time,
            progress,
          }
      }

      return Object.values(r).map(d => {
        d.tpf      /= d.progress
        d.ppd      /= d.progress
        d.run_time /= d.progress

        if (!isFinite(d.tpf)) d.tpf = 0

        return d

      }).sort((a, b) => {
        const x = cmp(a, b, this.avg)
        if (x) return x
        if (a.time != b.time) return b.time - a.time
        return a.project - b.project
      })
    }
  },


  mounted() {this.$machs.wus_enable(true)},


  methods: {
    column_class(col, config) {
      if (col.key == config.key)
        return 'fa fa-caret-' + (config.dir < 0 ? 'down' : 'up')
    },

    column_format(name, value) {
      switch (name) {
      case 'tpf':      return value ? this.$util.time_interval(value) : '???'
      case 'ppd':      return Math.round(value || 0).toLocaleString()
      case 'progress': return value.toLocaleString()
      case 'time':     return this.$util.since(value)
      default:         return value
      }
    },


    sort(name, key) {
      let table = this[name]
      if (table.key == key) table.dir *= -1
      else table.key = key
    },


  }
}
</script>

<template lang="pug">
.wus-view.page-view
  MainHeader

  .view-body
    .wus
      HelpBalloon.header-title(name="Work Unit Averages")
        p.
          Each row contains average values computed over multiple Work Unit
          runs of the same project using the same compute resources.
          Compute resources consist of CPUs and GPUs.

        p.
          Average Time Per Frame and Points Per Day are estimates of WU
          performance.

        p Columns can be sorted by clicking on the column header.

      table.view-table
        tr
          th.column-sortable(v-for="col in avg_columns", :title="col.title",
            :class="'column-' + col.key", @click="sort('avg', col.key)")
            | {{col.name}}
            .fa(:class="column_class(col, avg)")

        tr(v-for="p in performance")
          td(v-for="col in avg_columns", :title="col.title",
            :class="'column-' + col.key")
            | {{column_format(col.key, p[col.key])}}

      HelpBalloon.header-title(name="Recent Work Unit History"): p.
        A log of recent work WUs completed by your machines.

      .units-view(:style="Unit.get_column_grid_style(columns, ' 1fr')")
        UnitHeader(:columns="columns") Info

        UnitsView(:units="wus", :columns="columns", v-slot="{unit}")
          Button.button-icon(icon="info-circle",
            :route="`/unit/${unit.id}`", title="View Work Unit details")
</template>

<style lang="stylus">
.wus-view
  .view-body
    .wus
      table
        width 100%
        margin-bottom var(--gap)

        th
          vertical-align unset

          &.column-sortable
            cursor pointer

          > .fa
            width 0.75em
            text-align center

        td, th
          text-align right

          &.column-resources
            text-align left
            overflow hidden
            text-overflow ellipsis
            max-width 10em
            width 100%

      .button
        font-size 12pt
</style>
