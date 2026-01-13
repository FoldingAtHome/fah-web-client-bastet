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
  name: 'Pacify',
  data() {return {active: false}},


  methods: {
    open()  {
      if (this.active) return
      this.$util.lock_scrolling()
      this.active = true
    },


    close() {
      if (!this.active) return
      this.$util.unlock_scrolling()
      this.active = false
    }
  }
}
</script>

<template lang="pug">
Teleport(to="body")
  .pacify-overlay(v-show="active")
    .fa.fa-spinner.fa-pulse
</template>

<style lang="stylus">
.pacify-overlay
  position absolute
  top 0
  left 0
  width 100vw
  height 100vh
  background var(--pacify-bg)
  display flex
  overflow hidden
  align-items center
  justify-content center
  color #aaaa
  font-size 400%
</style>
