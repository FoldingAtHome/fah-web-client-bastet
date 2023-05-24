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
  props: ['name'],
  data() {return {hover: false}},

  methods: {
    enter() {
      if (this.$root._help_balloon) this.$root._help_balloon.hover = false
      this.$root._help_balloon = this
      clearTimeout(this.timer)
      this.hover = true
    },


    leave() {
      this.timer = setTimeout(() => {
        this.hover = false

        if (this.$root._help_balloon == this)
          delete this.$root._help_balloon
      }, 500)
    }
  }
}
</script>

<template lang="pug">
label.help-balloon(@mouseenter="enter", @mouseleave="leave")
  | {{name}}
  |
  span
    .fa(:class="hover ? 'fa-caret-left' : 'fa-question'")
    .help-content(v-if="hover"): slot
</template>

<style lang="stylus">
@import('colors.styl')

.help-balloon
  display inline-block

  > span
    display inline-block
    width 0.5em

    > .fa
      display inline-block
      height 1em
      vertical-align unset
      font-size 100%
      color border-color

  > span > .fa-caret-left
    transform scale(2.5)

  .help-content
    display inline-block
    position absolute
    margin-top -6px
    margin-left 3px
    font-size 12pt
    white-space normal
    text-align left
    width 30em
    max-width 80vw
    font-weight normal
    background #fff
    border 1px solid border-color
    border-radius 4px
    padding 1em
    box-shadow 4px 4px 8px #666
    color initial

    p:first-child
      margin-top 0

    p:last-child
      margin-bottom 0
</style>
