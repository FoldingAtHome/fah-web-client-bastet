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
  name: 'Dialog',
  emits: ['close'],

  props: {
    buttons: {
      default(rawProps) {
        return [{
          name: 'Ok',
          icon: 'check'
        }, {
          name: 'Cancel',
          icon: 'times'
        }]
      }
    },

    allowCancel: {type: Boolean, default: true},
    zIndex: {type: Number, default: 100}
  },


  data() {
    return {
      active: false
    }
  },


  methods: {
    open(resolve)  {
      if (this.active) return
      util.lock_scrolling()
      this.active = true
      this.resolve = resolve
    },


    close(result) {
      if (!this.active) return
      util.unlock_scrolling()
      this.active = false

      if (result) this.$emit('close', result)
      if (this.resolve) this.resolve(result)
      this.resolve = undefined
    }
  }
}
</script>

<template lang="pug">
Teleport(to="body")
  .dialog-overlay(v-if="active", :style="{'z-index': zIndex}")
    .dialog(@click.prevent.stop="true")
      .dialog-header
        .dialog-header-slot: slot(name="header")
        .dialog-close(v-if="allowCancel", @click="close('cancel')")
          .fa.fa-times

      .dialog-body
        slot(name="body")

      .dialog-footer
        Button(v-for="b in buttons", @click="close(b.name)", v-bind="b")
</template>

<style lang="stylus">
@import('./colors.styl')

.dialog-overlay
  position absolute
  top 0
  left 0
  width 100vw
  height 100vh
  background overlay-bg

  .dialog
    width 30em
    margin 16% auto
    min-height 10em
    background panel-bg
    box-shadow 3px 3px 12px #222

    > *
      padding 1em

    .dialog-header
      background header-bg
      color header-fg
      border-bottom 1px solid border-color
      display flex
      gap 0.5em

      > :first-child
        flex 1

      .dialog-close
        flex 0
        cursor pointer

        &:hover
          color #888

    .dialog-footer
      display flex
      justify-content right
      gap 1em

      button
        margin 0
</style>
