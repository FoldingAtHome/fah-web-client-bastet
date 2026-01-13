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
  name: 'Button',
  props: {
    name:     {},
    text:     {},
    icon:     {},
    image:    {},
    href:     {},
    route:    {},
    klass:    {},
    disabled: {type: Boolean},
    success:  {type: Boolean},
    replace:  {type: Boolean},
  },
  emits: ['click'],


  computed: {
    _class() {
      let klass = {}

      if (typeof this.klass == 'string')
        for (let k of this.klass.split(' '))
          klass[k] = true

      else klass == this.klass || {}

      return Object.assign(klass, {
        'button-disabled': this.disabled,
        'button-success':  this.success
      })
    },


    _icon() {
      if (this.icon) return this.icon

      let text = (this.text || this.name || '').toLowerCase()
      switch (text) {
      case 'ok':     case 'yes': return 'check'
      case 'cancel': case 'no':  return 'times'
      case 'save':               return 'floppy-o'
      case 'open':               return 'folder-open'
      case 'discard':            return 'trash'
      case 'add': case 'create': return 'plus'
      case 'edit':               return 'pencil'
      case 'login':              return 'sign-in'
      case 'logout':             return 'sign-out'
      default: return text
      }
    },


    link() {
      if (!this.disabled) {
        if (this.href) return this.href
        if (this.$util.isObject(this.route)) return this.route.path
        return this.route
      }
    },


    content() {
      return this.text == undefined ?
        this.$util.capitalize(this.name) : this.text
    }
  },


  methods: {
    click(event) {
      if (this.disabled) return event.preventDefault()
      if (this.href) return
      event.preventDefault()

      if (this.route) {
        if (this.replace) this.$router.replace(this.route)
        else this.$router.push(this.route)

      } else this.$emit('click', event)
    }
  }
}
</script>

<template lang="pug">
a.button(@click="click", :href="link", :target="href ? '_blank' : ''",
  :class="_class")
  .fa(v-if="_icon", :class="'fa-' + _icon")
  img(v-if="image", :src="image")
  span.button-content(v-if="content") {{content}}
</template>

<style lang="stylus">
a.button
  cursor pointer
  font-weight bold
  padding calc(var(--gap) * 0.75) var(--gap)
  border 0
  color var(--button-fg)
  background var(--button-bg)
  white-space nowrap
  display inline-flex
  gap calc(var(--gap) / 2)
  flex-direction row
  justify-content center
  align-items center
  text-decoration none
  border-radius var(--border-radius)
  font-size 85%

  &.button-success
    background var(--button-success)

  &.button-caution
    background var(--button-caution)

  &:hover
    background var(--link-color)

  &.button-image, &.button-icon
    padding 0
    background transparent

  &.button-icon
    background transparent
    color var(--button-icon-fg)
    font-size 110%
    justify-content center

    &:hover
      color var(--link-color)

  &.button-image
    border 1px solid transparent
    border-radius var(--border-radius)
    overflow hidden

    &:hover
      border-color var(--link-color)

  img
    max-width 48px
    max-height 48px

  &.button-disabled
    color var(--button-disabled-fg)
    background var(--button-disabled-bg)
    cursor default

    &:hover
      background var(--button-disabled-bg)

    &.button-icon
      background transparent
      color var(--button-disabled-fg)

      &:hover
        background transparent

@media (max-width 800px)
  a.button
    padding calc(var(--gap) * 0.5) calc(var(--gap) * 0.75)
    gap calc(var(--gap) * 0.5)
</style>
