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
import util from './util'


export default {
  name: 'Button',
  props: [
    'name', 'text', 'icon', 'image', 'disabled', 'href', 'route', 'success'],
  emits: ['click'],


  computed: {
    link() {
      if (!this.disabled) {
        if (this.href) return this.href
        if (util.isObject(this.route)) return this.route.path
        return this.route
      }
    },


    content() {
      return this.text == undefined ? util.capitalize(this.name) : this.text
    }
  },


  methods: {
    click(event) {
      if (this.disabled) return event.preventDefault()
      if (this.href) return
      event.preventDefault()
      if (this.route) this.$router.push(this.route)
      else this.$emit('click', event)
    }
  }
}
</script>

<template lang="pug">
a.button(@click="click", :href="link", :target="href ? '_blank' : ''",
  :class="{'button-disabled': disabled, 'button-success': success}")
  .fa(v-if="icon", :class="'fa-' + icon")
  img(v-if="image", :src="image")
  | {{content}}
</template>

<style lang="stylus">
@import('colors.styl')

a.button
  cursor pointer
  margin 0.5em 0
  font-weight bold
  padding 0.75em 1.5em
  border 0
  color button-fg
  background button-bg
  white-space nowrap
  display flex
  gap 0.5em
  flex-direction row
  text-decoration none

  &.button-success
    background button-success

  &.button-caution
    background button-caution

  &:hover
    background link-color

  &.button-image, &.button-icon
    padding 0
    background transparent

  &.button-icon
    color black
    font-size 110%

    &:hover
      color link-color

  &.button-image
    border 1px solid transparent
    border-radius 4px
    overflow hidden

    &:hover
      border-color link-color

  img
    margin 0
    max-width 48px
    max-height 48px

  &.button-disabled
    color button-disabled-fg
    background button-disabled-bg
    cursor default

    &:hover
      background button-disabled-bg

    &.button-icon
      background transparent
      color button-disabled-fg

      &:hover
        background transparent
</style>
