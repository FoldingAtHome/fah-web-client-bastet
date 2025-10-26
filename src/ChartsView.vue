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
import Chart      from './chart.js'
import DataSeries from './data-series.js'


const colors = ['#ee9322', '#0487ab', 'red']

const suffixes = [
  [10e17, 'E'], [10e14, 'P'], [10e11, 'T'], [10e8, 'G'], [10e5, 'M'],
  [10e2, 'k'], [1, '']
]


function format_time(t) {
  return new Date(t).toISOString().substring(0, 16).replace('T', ' at ')
}


function day_suffix(day) {
  if (day == 1 || day == 21 || day == 31) return 'st'
  if (day == 2 || day == 22) return 'nd'
  if (day == 3 || day == 23) return 'rd'
  return 'th'
}


function relative_filter(series, value) {
  if (!series.data.length) series._start = value
  value -= series._start
  return value
}


function delta_time(win, start, end)  {return win[end].time -  win[start].time}
function delta_value(win, start, end) {return win[end].value - win[start].value}


function day_rate_filter(series, value, time) {
  if (series._window == undefined) series._window = []
  let win = series._window

  win.push({value, time})
  if (win.length == 1) return

  const day = 24 * 60 * 60
  let last = win.length - 1

  while (2 < win.length && day < delta_time(win, 1, last)) {win.shift(); last--}

  let dTime  = delta_time (win, 0, last)
  let dValue = delta_value(win, 0, last)

  if (dTime < day) return

  let diff = dTime - day
  dTime = day
  dValue -= diff / delta_time(win, 0, 1) * delta_value(win, 0, 1)

  if (series._last != undefined && time - series._last < 60 * 60) return
  series._last = time

  return dValue / dTime
}


export default {
  props: {
    charts: {default: []},
    config: {default: {}},
    mode:   {default: 'PPD'},
    source: {default: 'Team'},
  },


  data() {
    return {
      modes:  ['Points', 'WUs', 'PPD'],
      series: [],
      subs:   [],
      _config: {
        labels:  {size: 14, enabled: true},
        offsets: {left: 40, right: 6, top: 6, bottom: 16},
        columns: this.compute_columns,
        rows:    this.compute_rows,
        coords:  this.set_coords,
      },
      title:  '',
      coords: '',
      color:  '',
    }
  },


  watch: {
    charts() {this.reset()},
    mode()   {this.reset()},
    source() {this.reset()},
  },


  mounted() {
    this.$util.merge_objs(this._config, this.config || {})
    this.chart = new Chart(this.$refs.chart, this._config, this.series)
    this.reset()
  },


  beforeUnmount() {this.chart.stop()},


  methods: {
    source_enabled(src) {
      let source = this.source.toLowerCase()
      return [src.toLowerCase(), 'both'].indexOf(source) != -1
    },


    on_click(e) {this.$emit('activate', 'click')},


    clear() {
      for (let sub of this.subs) this.$apiSock.unsubscribe(sub)
      this.series.length = 0
      this.subs.length   = 0
      this.coords        = ''
      this.chart.stop()
    },


    reset() {
      this.clear()
      this.charts.map(this.add_chart)
      this.chart.start()
      this.title = `${this.source} ${this.mode}`
    },


    format_coords(coords) {
      let value = coords.y.toLocaleString()

      switch (this.mode.toLowerCase()) {
      case 'ppd':    return ' earned '    + value + ' PPD on '
      case 'points': return ' gained '    + value + ' points by '
      case 'wus':    return ' completed ' + value + ' WUs by '
      }
    },


    points_filter(series, data) {
      return relative_filter(series, data.value.score)
    },


    wus_filter(series, data) {
      return relative_filter(series, data.value.wus)
    },


    ppd_filter(series, data, time) {
      let rate = day_rate_filter(series, data.value.score, time)
      if (rate != undefined) return Math.round(rate * 24 * 60 * 60)
    },


    filter_data(series, data) {
      let time  = new Date(data.time).getTime() / 1000
      let value = this[this.mode.toLowerCase() + '_filter'](series, data, time)

      if (value != undefined) {
        series.add({x: time, y: value})
        this.chart.redraw()
      }
    },


    add_chart(chart) {
      let color    = colors[this.series.length]
      let series   = new DataSeries(color, this.source_enabled(chart.type))
      series.chart = chart
      this.series.push(series)

      let cb = data => this.filter_data(series, data)
      this.subs.push(this.$apiSock.subscribe(chart, cb))
    },


    set_coords(coords) {
      let time    = format_time(coords.x * 1000)
      let chart   = coords.series.chart
      let type    = this.$util.capitalize(chart.type)
      let label   = `${type} ${chart.team || chart.user || ''}`
      this.coords = label + ' ' + this.format_coords(coords) + time
      this.color  = coords.series.color
    },


    compute_rows(min, max, height) {
     let y    = max
     let rows = []
     let suffix
     let scale

      for (let s of suffixes)
        if (s[0] <= y) {
          scale  = s[0]
          suffix = s[1]
          break
        }

      let maxRows = height / (this._config.labels.size + 2) - 1
      maxRows = Math.max(maxRows, 3)

      let step  = scale
      let range = max - min
      while (maxRows < range / step) step *= 10
      while (range / step < 1) step /= 10
      if (range / step < 3) step /= 2

      let row = min
      if (min % step) row += step - min % step

      while (row < max) {
        let text = row / scale + suffix
        rows.push({row, text})
        row += step
      }

      return rows
    },


    compute_columns(min, max, width) {
      let cols    = []
      let step    = 24 * 60 * 60
      let range   = max - min
      let maxCols = width / ((this._config.labels.size + 2) * 5 * 0.6) - 1

      maxCols = Math.max(maxCols, 3)
      while (maxCols < range / step) step *= 2

      let col = Math.round(min + step - min % step)

      while (col < max) {
        let day  = new Date(col * 1000).getUTCDate()
        let text = day + day_suffix(day)
        cols.push({col, text})
        col += step
      }

      return cols
    }
  }
}
</script>

<template lang="pug">
.charts-view(:title="title", @click="on_click")
  canvas(ref="chart")
  .chart-coords(:style="{color}") {{coords}}
</template>

<style lang="stylus">
.charts-view
  display flex
  flex-direction column

  canvas
    flex 1
    width 100% !important
    height 100% !important

  .chart-coords
    font-family mono
    text-align right
    height 1.5rem
    margin-top 4px
</style>
