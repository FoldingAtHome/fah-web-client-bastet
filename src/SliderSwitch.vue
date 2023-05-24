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
  props: ['modelValue'],
  emits: ['update:modelValue'],


  computed: {
    value: {
      get() {return this.modelValue},
      set(value) {this.$emit('update:modelValue', value)}
    }
  }
}
</script>

<template lang="pug">
.slider-switch
  input(type="checkbox", v-model="value")
  .slider-handle: .fa(:class="'fa-' + (modelValue ? 'moon-o' : 'sun-o')")
</template>

<style lang="stylus">
handle-size = 1.75em

.slider-switch
  position relative
  display flex
  flex-direction column
  background-color #666
  height handle-size

  .fa
    font-size 14pt

  input
    position absolute
    display block
    width 100%
    height 100%
    top 0
    bottom 0
    left 0
    right 0
    opacity 0
    z-index 100
    cursor pointer

  .slider-handle
    position absolute
    left 0
    transition .4s
    display flex
    background-color #999
    transition .4s
    align-items center
    justify-content center
    width handle-size
    height 100%

  input:checked + .slider-handle
    background-color #000
    left "calc(100% - %s)" % handle-size
</style>
