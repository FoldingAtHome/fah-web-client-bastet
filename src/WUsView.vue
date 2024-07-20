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


function cmp_wus(a, b) {
  return new Date(b.assignment.time).getTime() -
    new Date(a.assignment.time).getTime()
}


export default {
  name: 'WUsView',


  computed: {
    columns() {
      return ['Number', 'Project', 'Core', 'Status', 'Progress',
        'TPF', 'PPD', 'Assign Time']
    },


    Unit() {return Unit},
    wus() {return Array.from(this.$machs.get_units()).sort(cmp_wus)},


    performance() {
      let r = {}

      for (let unit of this.$machs.get_units()) {
        unit = new Unit(this.$ctx, unit)
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
            id:       desc,
            project:  unit.project,
            core:     unit.core,
            cpus:     unit.cpus,
            gpus:     unit.unit.gpus,
            tpf:      unit.tpf_secs * progress,
            ppd:      (unit.unit.pdd || 0) * progress,
            run_time: unit.run_time_secs || 0,
            time,
            progress,
          }
      }

      return Object.values(r).map(d => {
        d.tpf /= d.progress
        d.ppd /= d.progress
        return d

      }).sort((a, b) => {
        if (a.time != b.time) return b.time - a.time
        return a.project - b.project
      })
    }
  },


  mounted() {this.$machs.wus_enable(true)},
}
</script>

<template lang="pug">
.wus-view.page-view.fixed-view
  MainHeader

  .view-body
    .wus
      .header-title Work Unit Averages
      table.view-table
        tr
          th Project
          th Core
          th CPUs
          th GPUs
          th TPF
          th PPD
          th Run Time
          th Units
          th Last Assigned

        tr(v-for="p in performance")
          td {{p.project}}
          td {{p.core}}
          td {{p.cpus}}
          td(:title="p.gpus.join(' ')") {{p.gpus.length}}
          td(title="Average Time Per Frame") {{$util.time_interval(p.tpf)}}
          td(title="Average Points Per Day")
            | {{Math.round(p.ppd || 0).toLocaleString()}}
          td(title="Total run time") {{$util.time_interval(p.run_time)}}
          td(title="Total Work Units including partials")
            | {{p.progress.toLocaleString()}}
          td(:title="$util.format_time(p.time)") {{$util.since(p.time)}} ago

      .header-title Recent Work Unit History
      .units-view(:style="Unit.get_column_grid_style(columns, ' 1fr')")
        UnitHeader(:columns="columns") Info

        UnitsView(:units="wus", :columns="columns", v-slot="{unit}")
          Button.button-icon(icon="info-circle",
            :route="`/unit/${unit.id}`", title="View Work Unit details")
</template>

<style lang="stylus">
.wus-view
  .view-body
    font-family var(--mono-font)

    .wus
      overflow auto
      flex 1

      table
        width 100%
        margin-bottom var(--gap)

        td, th
          text-align right

      .button
        font-size 12pt

      :not(.column-header).column-actions
        justify-content center
</style>
