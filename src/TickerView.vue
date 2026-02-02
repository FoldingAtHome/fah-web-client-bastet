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
  name: 'TickerView',


  data() {
    return {
      count: 0,
      index: 0,
      slots: [{offset: 20}, {offset: 40}]
    }
  },


  computed: {
    feed() {return this.$news.get_feed()}
  },


  mounted() {
    this.slots[0].el = this.$refs.slot0
    this.slots[1].el = this.$refs.slot1
    this.update()
  },


  methods: {
    update() {
      if (this.feed.length < 2) return setTimeout(() => this.update(), 1000)

      let delay = 100

      for (let slot of this.slots) {
        if (slot.offset == 20) {
          if (this.feed.length <= this.index) this.index = 0
          let item = this.feed[this.index++]
          slot.el.textContent = item.title
          slot.el.href        = item.url
        }

        if (!slot.offset) delay = 5000

        slot.el.style.top = `${slot.offset / 10 + 0.4}em`
        slot.offset--
        if (slot.offset <= -20) slot.offset = 20
      }

      return setTimeout(() => this.update(), delay)
    }
  }
}
</script>

<template lang="pug">
.ticker-view.view-panel
  a.ticker-slot(ref="slot0", target="_blank")
  a.ticker-slot(ref="slot1", target="_blank")
</template>

<style lang="stylus">
.ticker-view
  padding 0.25em
  height 2em
  overflow hidden
  text-align center
  position relative
  max-width 100vw

  .ticker-slot
    position absolute
    display block
    height 1.5em
    text-decoration none
    color var(--title-color)
    white-space nowrap
    text-overflow ellipsis
    width 95%

    &:hover
      color var(--link-color)
</style>
