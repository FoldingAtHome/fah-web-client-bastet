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
  props: ['id', 'data'],


  data() {
    return {
      collapse: false
    }
  },


  computed: {
    unit() {
      if (this.data.units == undefined) return

      for (let unit of this.data.units)
        if (unit.id == this.id)
          return unit
    },


    assignment() {return this.unit.assignment || {}},
    core() {return this.assignment.core.type},
    paused() {return this.data.config.paused || this.unit.paused},
    state() {return this.paused ? 'PAUSED' : this.unit.state},
    timeout() {return addTime(this.assignment.time, this.assignment.timeout)},
    deadline() {return addTime(this.assignment.time, this.assignment.deadline)},
  }
}
</script>

<template lang="pug">
.details-view
  .details-header
    Button(@click="collapse = !collapse",
      :title="collapse ? 'Expand' : 'Collapse'",
      :icon="'chevron-' + (collapse ? 'down' : 'left')")

    h3(v-if="!collapse") Work Unit Details

  .details(v-if="unit && !collapse")
    label Project:
    span {{assignment.project}}

    label Run:
    span {{unit.wu.run}}

    label Clone:
    span {{unit.wu.clone}}

    label Generation:
    span {{unit.wu.gen}}

    label Core:
    span {{core}}

    label State:
    span {{state}}

    label Pause Reason:
    span {{unit['pause-reason']}}

    label Progress:
    span {{(unit.progress * 100).toFixed(1)}}%

    label ETA:
    span {{unit.eta}}

    label Runtime:
    span {{unit['run-time']}}s

    label Base Credit:
    span {{assignment.credit}}

    label PPD:
    span {{unit.ppd}}

    label CPUs:
    span {{assignment.cpus}}

    label GPUs:
    span {{assignment.gpus ? assignment.gpus.join(' ') : ''}}

    label Deadline:
    span {{deadline}}

    label Timeout:
    span {{timeout}}

    label Work Server:
    span {{assignment.ws}}

    label Collection Servers:
    span {{unit.wu.cs}}

    label Assign Time:
    span {{assignment.time}}
</template>

<style lang="stylus">
.details-view
  .details-header
    display flex

    h3
      margin 0.5em 1em
      font-weight normal
      font-size 150%

    button
      padding 0.5em 1em
      background transparent

      &:hover
        background #444

  .details
    display grid
    grid-template-columns auto 1fr
    gap 0.5em
    width 30em
    max-width 100vw

    label
      font-weight bold
      text-align right
      white-space nowrap
</style>
