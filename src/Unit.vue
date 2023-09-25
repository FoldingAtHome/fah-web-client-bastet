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
import util from './util.js'
import UnitDetailsDialog from './UnitDetailsDialog.vue'


const status = {
  'ASSIGN':   'Requesting work',
  'DOWNLOAD': 'Downloading work',
  'CORE':     'Downloading core',
  'RUN':      'Running',
  'FINISH':   'Finishing',
  'UPLOAD':   'Uploading',
  'CLEAN':    'Cleaning up',
  'WAIT':     'Waiting',
  'PAUSE':    'Paused'
}

const icons = {
  'ASSIGN':   'download',
  'DOWNLOAD': 'download',
  'CORE':     'download',
  'RUN':      'refresh',
  'FINISH':   'refresh',
  'UPLOAD':   'upload',
  'CLEAN':    'eraser',
  'WAIT':     'clock-o',
  'PAUSE':    'pause'
}


export default {
  props: ['unit', 'mach'],
  components: {UnitDetailsDialog},


  data() {
    return {
      project_url: 'https://stats.foldingathome.org/project/',
      waiting: false,
      wait_progress: 0
    }
  },


  watch: {
    'unit.wait'() {this.update_wait()}
  },


  computed: {
    info()     {return this.mach.get_info()},
    disabled() {return !this.mach.is_connected()},


    project() {
      if (this.unit.assignment) return this.unit.assignment.project
    },


    wu() {return this.unit.wu},


    unit_id() {
      if (this.wu)
        return `Run ${this.wu.run} Clone ${this.wu.clone} Gen ${this.wu.gen}`
    },


    resources() {
      let l = []

      if (this.unit.cpus) l.push('cpu:' + this.unit.cpus)

      if (this.unit.gpus && this.info.gpus)
        for (let i = 0; i < this.unit.gpus.length; i++) {
          let id = this.unit.gpus[i]
          if (this.info.gpus[id]) l.push(id)
        }

      return l.join(' ')
    },


    paused() {return !!this.unit.pause_reason},
    config() {return this.mach.get_data().config || {}},


    state() {
      if (this.waiting) return 'WAIT'
      if (this.unit.pause_reason) return 'PAUSE'
      if (this.unit.state == 'RUN' && this.config.finish) return 'FINISH'
      return this.unit.state
    },


    icon() {return icons[this.state]},


    eta() {
      if (this.waiting) {
        let eta = new Date(this.unit.wait).getTime() - (new Date).getTime()
        // Use "progress" to force updates
        return util.time_interval(eta / 1000, this.progress)
      }

      return this.unit.eta
    },


    status() {
      return this.unit.pause_reason || status[this.state]
    },


    progress() {
      let p = this.waiting ? this.wait_progress : this.unit.progress
      return isNaN(p) ? 0 : (p * 100).toFixed(1)
    },


    can_dump() {return (this.paused || this.waiting) && !this.disabled}
  },


  mounted() {this.update_wait()},


  methods: {
    async dump(id) {
      let result = await this.$root.message(
        'confirm', 'Dump Work Unit?',
        'Are you sure you want to dump this Work Unit.  All progress on this ' +
        'Work Unit will be lost and no points will be awarded.')

      if (result == 'ok') this.mach.dump(id)
    },


    update_wait() {
      if (!this.unit.wait) return

      let now = Date.now()
      let t = new Date(this.unit.wait).getTime()


      if ((this.waiting = now < t)) {
        this.wait_progress = 1 - (t - now) / 1000 / this.unit.delay
        setTimeout(this.update_wait, 250)
      }
    },


    show_details() {this.$refs.details_dialog.exec()}
  }
}
</script>

<template lang="pug">
UnitDetailsDialog(ref="details_dialog", :unit="unit")

tr.unit(:class="{disabled: disabled}", :title="disabled ? 'Disconnected' : ''")
  td.name {{mach.get_name()}}
  td.project
    a(v-if="project", :href="project_url + project", target="_blank",
      :title="unit_id") {{project}}

  td.resources {{resources}}

  td.status(:class="state.toLowerCase()")
    | #[.fa(:class="'fa-' + icon")] {{status}}

  td.progress-cell(:title="'ETA ' + eta")
    .progress
      .progress-bar(:style="{width: progress + '%'}")
      span {{progress}}%

  td.eta {{eta}}

  td.actions
    Button.button-icon(:disabled="!can_dump", @click="dump(unit.id)",
      icon="trash", title="Dump this Work Unit.")

    Button.button-icon(:disabled="disabled",
      :route="mach.get_url('/log?q=:WU' + unit.number + ':')",
      icon="list-alt", title="View Work Unit log.")

    Button.button-icon(@click="show_details", icon="info-circle",
      :disabled="!unit.wu", title="View Work Unit details.")

    Button.button-icon(
      :route="mach.get_url('/view/' + unit.id)", icon="eye",
      :disabled="!unit.wu || disabled", title="View 3D protein.")
</template>

<style lang="stylus">
@import('./colors.styl')

.unit
  &.disabled
    color #666
    background #aaa !important

  .status.run, .status.finish
    .fa
      color green
      animation spin 4s linear infinite

  @keyframes spin
    100%
      transform rotate(360deg)

  .progress-cell
    width 100%

  .progress
    position relative
    height 1.3rem
    width 100%
    border-radius .25rem
    overflow hidden
    font-size 1.1rem
    background #aaa
    color #fff

    .progress-bar
      height 100%
      display flex
      color #fff
      text-align center
      white-space nowrap
      background-color green
      transition width .6s ease
      background-image linear-gradient(45deg, rgba(255,255,255,.15) 25%,
        transparent 25%, transparent 50%, rgba(255,255,255,.15) 50%,
        rgba(255,255,255,.15) 75%, transparent 75%, transparent)
      background-size 1rem 1rem

    > span
      position absolute
      top 0
      width 100%
      text-align center
      z-index 2
</style>
