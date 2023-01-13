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
import ButtonImpl from './ButtonImpl.vue'


export default {
  name: 'Button',
  props: ['name', 'text', 'icon', 'disabled', 'href', 'route'],
  emits: ['click'],
  components: {ButtonImpl}
}
</script>

<template lang="pug">
a(v-if="href", :href="href", target="_blank")
  ButtonImpl(v-bind="$props")

ButtonImpl(v-else, v-bind="$props", @click="$emit('click', event)")
</template>

<style lang="stylus">
@import('colors.styl')

button
  cursor pointer
  margin 0.5em 0
  font-weight bold
  padding 0.75em 1.5em
  border 0
  color button-fg
  background button-bg
  white-space nowrap

  &.button-success
    background button-success

  &:hover
    background link-color

  &.button-icon
    padding 0
    background transparent
    color black
    font-size 110%

    &:hover
      color link-color

button[disabled]
  color button-disabled-fg
  background button-disabled-bg
  cursor initial

  &:hover
    background button-disabled-bg

  &.button-icon
    background transparent
    color button-disabled-fg

    &:hover
      background transparent
</style>
