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
export default {
  name: 'PopupMenu',
  props: {title: {}},
  data() {return {show: false}},

  methods: {
    close() {setTimeout(() => {this.show = false}, 250)}
  }
}
</script>

<template lang="pug">
Teleport(to="body")
  .popup-overlay(v-if="show", @click="show = false")

.popup-menu(@click="show = true", :title="title")
  Button.button-icon(icon="bars")
  .popup-content(@mouseup="close")
    slot(v-if="show")
</template>

<style lang="stylus">
.popup-overlay
  position fixed
  top 0
  left 0
  width 100vw
  height 100vh
  background-color rgba(64, 64, 64, 0.2)

.popup-menu
  position relative
  justify-content end

  .popup-content
    top 0
    right 0
    position absolute
    display flex
    flex-direction column
    background-color var(--popup-bg)
    border var(--popup-border)
    border-bottom none
    border-radius var(--border-radius)
    opacity 1
    z-index 100
    justify-content start
    overflow hidden

    > *, > .button
      justify-content left
      margin 0
      padding 0.5em
      border-bottom var(--popup-border)
      border-radius 0
      height 2em

      &:hover
        background-color rgba(255, 255, 255, 0.1)

      .fa
        width 1em
        text-align center
</style>
