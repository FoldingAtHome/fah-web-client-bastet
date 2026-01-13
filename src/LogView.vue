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
  name: 'LogView',
  props: ['mach', 'query'],


  data() {
    return {
      search: '',
      errors: false,
      warnings: false,
      follow: true,
      line_height: 0,
      view_height: 0,
      scroll_percent: 0,
      log_top: 0,
      scroll_ratio: 0,
      top_line: 0
    }
  },


  watch: {
    count()  {this.update()},
    follow() {this.scroll_to_end()}
  },


  computed: {
    count() {return this.lines.length},


    visible_lines() {
      let lines = this.lines.slice(this.start, this.end)
      return lines.map(line => [line[0], this.$util.ansi2html(line[1])])
    },


    log() {
      let log = this.mach.get_data().log || []
      let count = 0
      return log.map(line => [count++, line])
    },


    lines() {
      let lines = this.log

      if (this.match_exp)
        lines = lines.filter(line => line[1].match(this.match_exp))

      return lines
    },


    match_exp() {
      try {
        let exp = new RegExp(this.search, 'i')

        if (this.errors || this.warnings) {
          let exp2 = new RegExp(':[' + (this.errors ? 'E' : '') +
                                (this.warnings ? 'W' : '') + '] :')
          return {[Symbol.match](s) {return s.match(exp) && s.match(exp2)}}
        }

        return exp

      } catch (e) {console.log(e)}
    },


    start() {
      let s = Math.min(Math.max(this.top_line - this.view_lines, 0), this.count)
      console.log('start', s)
      return s
    },


    end() {return Math.min(this.top_line + this.view_lines * 2, this.count)},
    view_lines()     {return Math.floor(this.view_height / this.line_height)},
    wrapper_height() {return Math.min(2000000, this.line_height * this.count)},


    content_offset() {
      if (this.end - this.start <= this.view_lines) return 0
      let lineOffset = (this.top_line - this.start + 1)
      let offset = this.log_top - lineOffset * this.line_height
      let max = this.wrapper_height - (this.end - this.start) * this.line_height
      return Math.min(Math.max(offset, 0), max)
    }
  },


  mounted()   {
    this.search = this.query
    this.mach.log_enable(true)

    // Compute log height
    let log = this.$refs.log
    let style = window.getComputedStyle(log)
    this.view_height = parseInt(style.getPropertyValue('height'))

    // Compute line-height
    let e = document.createElement('div')
    e.classList.add('log-line')
    e.innerHTML = 'X'
    log.appendChild(e)
    this.line_height = e.getBoundingClientRect().height
    log.removeChild(e)

    this.update()
  },


  unmounted() {this.mach.log_enable(false)},


  methods: {
    reset() {
      this.search = ''
      this.errors = this.warnings = false
    },


    update() {
      this.$nextTick(() => {
        this.scroll_to_end()
        this.update_scroll()
      })
    },


    scroll_to_end() {
      if (!this.follow) return
      let log = this.$refs.log
      log.scrollTop = log.scrollHeight
      this.update_scroll()
    },


    update_scroll() {
      let log  = this.$refs.log
      let wrap = this.$refs.wrap
      if (!log || !wrap) return this.log_top = this.top_line = 0

      let height   = wrap.getBoundingClientRect().height
      this.log_top = log.scrollTop

      this.scroll_ratio = Math.max(0,
        Math.min(this.log_top / (height - this.view_height), 1))

      let top = Math.floor((this.count - this.view_lines) * this.scroll_ratio)
      this.top_line = Math.min(Math.max(top, 0), this.count)

      this.follow = 1.0 == this.scroll_ratio
    },


    scroll() {
      let percent = Math.floor(100 * this.scroll_ratio)

      // Compute scroll percent for display
      if (this.scroll_percent != percent &&
        !(this.scroll_percent == 0 && percent == 100)) {
        this.scroll_percent = percent

        clearTimeout(this.fade_timer)
        this.$refs.percent.classList.remove('fade-out')
        this.fade_timer = setTimeout(() => {
          this.$refs.percent.classList.add('fade-out')
        }, 100)
      }

      if (this.timer == undefined)
        this.timer = setTimeout(() => {
          this.timer = undefined
          this.update_scroll()
        }, 250)
    }
  }
}
</script>

<template lang="pug">
.log-view.page-view.fixed-view
  ViewHeader(title="Machine Log", :subtitle="mach.get_name()")

  .view-body
    .view-panel.log-controls
      label Search
      input(v-model="search", type="text")
      label(title="Filter log for error messages").
        #[input(v-model="errors", type="checkbox")] Errors
      label(title="Filter log for warning messages").
        #[input(v-model="warnings", type="checkbox")] Warnings
      Button.button-icon(title="Reset search", icon="repeat", @click="reset")

    .log-percent.fade-out(ref="percent")
      div {{scroll_percent}}%

    .view-panel.log(@scroll="scroll", ref="log")
      .log-line(v-if="!log.length") Loading log...
      .log-line(v-else-if="!count") No matching log lines.

      .log-wrapper(v-else, ref="wrap",
        :style="{height: wrapper_height + 'px'}")
        .log-content(:style="{'padding-top': content_offset + 'px'}")
          .log-line(v-for="line in visible_lines", v-html="line[1]")
</template>

<style lang="stylus">
.log-view
  .view-body
    position relative
    font-family var(--mono-font)

    .view-panel
      color var(--log-fg)
      background var(--log-bg)

    .log-controls
      display flex
      flex-wrap wrap
      gap var(--gap)
      align-items center

      input[type=text]
        flex 1

    .log-percent
      position absolute
      left 10%
      top 45%
      width 80%
      margin auto
      text-align center
      font-size 32pt
      opacity 1
      pointer-events none
      color var(--panel-fg)

      &.fade-out
        opacity 0
        transition opacity 1s linear

    .log.view-panel
      flex 1
      overflow auto
      padding var(--gap)

      .log-line
        white-space nowrap
</style>
