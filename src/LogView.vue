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
export default {
  name: 'LogView',
  props: ['mach', 'query'],


  data() {
    return {
      search: '',
      errors: false,
      warnings: false,
      follow: true
    }
  },


  watch: {
    'lines.length'() {
      if (this.follow) this.$nextTick(this.scroll_to_end)
    }
  },


  computed: {
    lines() {
      let data  = this.mach.get_data()
      let lines = []

      for (let line of (data.log || []))
        if (!this.match_exp || line.match(this.match_exp))
            lines.push(line)

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
    }
  },


  mounted()   {
    this.search = this.query
    this.mach.log_enable(true)
  },


  unmounted() {this.mach.log_enable(false)},


  methods: {
    reset() {
      this.search = ''
      this.errors = this.warnings = false
    },


    scroll_to_end() {
      if (this.$refs.log)
        this.$refs.log.scrollTop = this.$refs.log.scrollHeight
    }
  }
}
</script>

<template lang="pug">
.log-view.page-view
  ViewHeader(title="Machine Log", :subtitle="mach.get_name()")

  .view-body
    .log-controls.view-panel
      label Search
      input(v-model="search", type="text")
      label(title="Filter log for error messages.").
        #[input(v-model="errors", type="checkbox")] Errors
      label(title="Filter log for warning messages.").
        #[input(v-model="warnings", type="checkbox")] Warnings
      Button(text="Reset", icon="repeat", @click="reset")
      label(title="Automatically scroll to the bottom of the log.").
        #[input(v-model="follow", type="checkbox")] Follow

    .log.view-panel(v-if="!lines.length") No matching log lines
    .log.view-panel(v-else ref="log")
      .log-line(v-for="line in lines" v-html="$util.ansi2html(line)")
</template>

<style lang="stylus">
.log-view
  height 100vh
  overflow hidden

  .view-body
    display flex
    flex-direction column
    flex 1
    gap 1em
    overflow hidden

    .log-controls
      display flex
      flex-wrap wrap
      gap 0.5em
      align-items center
      padding 0 1em

      input[type=text]
        flex 1

    .log
      flex 1
      color var(--log-fg)
      background var(--log-bg)
      padding 1em
      overflow scroll
      font-family courier

      .log-line
        white-space nowrap
</style>
