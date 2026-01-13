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
  name: 'Dialog',
  emits: ['close'],

  props: {
    buttons: {
      default() {
        return [
          {name: 'Cancel', icon: 'times'},
          {name: 'Ok',     icon: 'check', success: true}
        ]
      }
    },

    allowCancel:    {type: Boolean, default: true},
    allowClickAway: {type: Boolean, default: false},
    zIndex:         {type: Number,  default: 100},
    class:          {},
    width:          {default: '30em'},
    height:         {default: 'auto'},
    header:         {},
  },


  data() {
    return {active: false}
  },


  computed: {
    _buttons() {
      let buttons = this.$util.deepCopy(this.buttons)

      if (typeof buttons == 'string') buttons = buttons.split(' ')

      for (let i = 0; i < buttons.length; i++)
        if (typeof buttons[i] == 'string')
          buttons[i] = {name: buttons[i]}

      return buttons
    },


    style() {
      return {
        'z-index':               this.zIndex,
        'grid-template-columns': `1fr ${this.width} 1fr`,
        'grid-template-rows':    `1fr ${this.height} 1fr`,
      }
    }
  },


  methods: {
    click_away() {if (this.allowClickAway) this.close('cancel')},


    async exec()  {
      if (this.active) return
      this.$util.lock_scrolling()
      this.focus()
      this.active = true
      return new Promise(resolve => this.resolve = resolve)
    },


    close(result) {
      if (!this.active) return
      this.$util.unlock_scrolling()
      this.active = false

      if (result) result = result.toLowerCase()
      if (result) this.$emit('close', result)
      if (this.resolve) this.resolve(result)
      this.resolve = undefined
    },


    focus() {
      let e = this.$refs.dialog.querySelector('[focused]')
      if (e) this.$nextTick(() => this.$nextTick(() => {e.focus()}))
    }
  }
}
</script>

<template lang="pug">
Teleport(to="body")
  .dialog-overlay(ref="dialog" v-show="active", @click="click_away",
    :style="style")
    .dialog(:class="class", @click.stop="true")
      .dialog-header
        .dialog-header-slot.header-title: slot(name="header") {{header}}
        Button.dialog-close.button-icon(v-if="allowCancel",
          @click="close('cancel')", icon="times")

      .dialog-body
        slot(name="body")

      .dialog-footer
        Button(v-for="b in _buttons", @click="close(b.name)", v-bind="b")
</template>

<style lang="stylus">
.dialog-overlay
  position fixed
  top 0
  left 0
  width 100vw
  height 100vh
  background var(--overlay-bg)
  display grid
  grid-template-rows 0.25fr min-content 1fr
  grid-template-columns 1fr 30em 1fr

  .dialog
    max-width 100vw
    max-height 100vh
    overflow hidden
    grid-column 2
    grid-row 2
    color var(--body-fg)
    background var(--body-bg)
    box-shadow var(--shadow)
    display flex
    flex-direction column
    border-radius var(--border-radius)

    > *
      padding var(--gap)

    .dialog-header
      background var(--header-bg)
      color var(--header-fg)
      border-bottom 1px solid var(--border-color)
      display flex
      gap var(--gap)

      > :first-child
        flex 1

      .dialog-close
        flex 0

    .dialog-body
      flex 1
      overflow-y auto

    .dialog-footer
      display flex
      justify-content right
      gap var(--gap)
</style>
