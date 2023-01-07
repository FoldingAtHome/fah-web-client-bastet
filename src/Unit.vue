<script>
import util from './util.js'


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
  props: ['unit', 'client', 'peer', 'peerID'],


  data() {
    return {
      project_url: 'https://stats.foldingathome.org/project/',
      waiting: false,
      wait_progress: 0,
      dump_dialog_buttons: [
        {name: 'cancel', icon: 'times'},
        {name: 'dump', icon: 'trash'}
      ]
    }
  },


  watch: {
    'unit.wait'() {this.update_wait()}
  },


  computed: {
    project() {
      if (this.unit.assignment) return this.unit.assignment.project
    },


    wu() {return this.unit.wu},


    unit_id() {
      if (this.wu)
        return this.wu.run + ',' + this.wu.clone + ',' + this.wu.gen
    },


    resources() {
      let l = []

      if (this.unit.gpus)
        for (let i = 0; i < this.unit.gpus.length; i++)
          l.push(this.unit.gpus[i])

      l.push('cpu:' + this.unit.cpus)

      return l.join(' ')
    },


    paused() {return !!this.unit['pause-reason']},
    config() {return this.client.state.data.config || {}},


    state() {
      if (this.waiting) return 'WAIT'
      if (this.unit['pause-reason']) return 'PAUSE'
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
      return this.unit['pause-reason'] || status[this.state]
    },


    progress() {
      let p = this.waiting ? this.wait_progress : this.unit.progress
      return isNaN(p) ? 0 : (p * 100).toFixed(1)
    },


    can_dump() {return this.paused || this.waiting}
  },


  mounted() {this.update_wait()},


  methods: {
    dump(id) {
      this.$refs.dump_dialog.open(result => {
        if (result == 'dump') this.client.dump(id)
      })
    },


    update_wait() {
      if (!this.unit.wait) return

      let now = Date.now()
      let t = new Date(this.unit.wait).getTime()


      if ((this.waiting = now < t)) {
        this.wait_progress = 1 - (t - now) / 1000 / this.unit.delay
        setTimeout(this.update_wait, 250)
      }
    }
  }
}
</script>

<template lang="pug">
Dialog(:buttons="dump_dialog_buttons", ref="dump_dialog")
  template(v-slot:header) Dump Work Unit?
  template(v-slot:body).
    Are you sure you want to dump this Work Unit.  All progress on this
    Work Unit will be lost and no points will be granted.

tr.unit
  td.peer {{peer}}
  td
    a(v-if="project", :href="project_url + project", target="_blank")
      | {{project}}

  td(title="Run, Clone, Gen") {{unit_id}}

  td {{resources}}

  td.status(:class="state.toLowerCase()")
    | #[.fa(:class="'fa-' + icon")] {{status}}

  td {{eta}}

  td.progress-cell
    .progress
      .progress-bar(:style="{width: progress + '%'}")
      span {{progress}}%

  td.actions
    Button.button-icon(:disabled="!can_dump", @click="dump(unit.id)",
      icon="trash", title="Dump this Work Unit.")

    Button.button-icon(:route="'/' + peerID + '/log?q=:WU' + unit.number + ':'",
      icon="list-alt", title="View Work Unit log.")

    Button.button-icon(:route="'/' + peerID + '/view/' + unit.id", icon="eye",
      :disabled="!unit.wu", title="View 3D protein and Work Unit details.")
</template>

<style lang="stylus">
@import('./colors.styl')

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
