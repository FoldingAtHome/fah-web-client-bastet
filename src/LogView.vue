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
    'data.log.length'() {
      if (this.follow) this.$nextTick(this.scroll_to_end)
    }
  },


  computed: {
    data() {return this.mach.get_data()},


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
    match(s) {
      if (this.match_exp) return s.match(this.match_exp)
      return true
    },


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
  .view-header-container
    .view-header
      FAHLogo

      div
        h2 Work Unit Log
        h3 Machine {{mach.get_name()}}

      .actions
        Button(text="Close", icon="times", route="/")

  .view-body(v-if="data.log")
    .log-controls
      label Search
      input(v-model="search", type="text")
      label(title="Filter log for error messages.").
        #[input(v-model="errors", type="checkbox")] Errors
      label(title="Filter log for warning messages.").
        #[input(v-model="warnings", type="checkbox")] Warnings
      Button(text="Reset", icon="repeat", @click="reset")
      label(title="Automatically scroll to the bottom of the log.").
        #[input(v-model="follow", type="checkbox")] Follow

    .log-container
      .log(ref="log")
        .log-line(v-for="line in this.data.log", v-show="match(line)",
          v-html="$util.ansi2html(line)")
</template>

<style lang="stylus">
@import('colors.styl')

.log-view
  position fixed
  top 0
  left 0
  width 100vw
  height 100vh
  margin-left 0
  display flex
  flex-direction column

  .view-header-container .view-header
    padding 1em
    max-width 100vw

  .view-body
    width 100%
    height 100%
    max-width 100%
    padding 0
    flex 1
    align-self stretch
    display flex
    flex-direction column

    .log-controls
      padding 0.5em
      display flex
      gap 0.5em
      align-items center

      input[type=text]
        flex 1

    .log-container
      flex 1
      position relative

      .log
        position absolute
        height 100%
        width 100%
        color #7f7f7f
        background #000
        padding 1em
        overflow scroll

        .log-line
          white-space nowrap
</style>
