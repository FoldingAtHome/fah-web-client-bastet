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
function to_nibble(c)   {return '0123456789abcdef'[c & 0xf]}
function from_nibble(c) {return '0123456789abcdef'.indexOf(c)}

function to_hex(s) {
  let r = ''
  for (let i = 0; i < s.length; i++) {
    let code = s[i].charCodeAt()
    r += to_nibble(code >> 4) + to_nibble(code)
  }
  return r
}

function from_hex(s) {
  let r = ''
  for (let i = 0; i < s.length; i += 2) {
    let code = (from_nibble(s[i]) << 4) + from_nibble(s[i + 1])
    r += String.fromCharCode(code)
  }
  return r
}

function setData(e, data) {e.dataTransfer.setData(to_hex(data), '')}
function getData(e) {return from_hex(e.dataTransfer.types[0])}


function square(x) {return x * x}


function dist2D(a, b) {
  return Math.sqrt(square(a.x - b.x) + square(a.y - b.y))
}


function elemContains(e, x, y) {
  let bounds = e.getBoundingClientRect()

  return bounds.left < x && x < bounds.right &&
         bounds.top  < y && y < bounds.bottom
}


function elemCenter(e) {
  let rect = e.getBoundingClientRect()
  return {x: rect.x + rect.width / 2,
          y: rect.y + rect.height / 2}
}


function elemDist2d(a, b) {return dist2D(elemCenter(a), elemCenter(b))}


export default {
  name: 'Draglist',
  props: {
    list: Array,
    removable: {default: true}
  },


  data() {
    return {
      dragging: null,
      depth: 0
    }
  },


  methods: {
    dragstart(e) {
      let text = e.target.textContent
      this.dragging = text
      e.dataTransfer.clearData()
      setData(e, text)

      let img = document.createElement('img')
      img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///' +
        'yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
      e.dataTransfer.setDragImage(img, 0, 0)
    },


    dragend(e) {this.dragging = null},


    dragover(e) {
      e.preventDefault()
      e.dataTransfer.effectAllowed = 'move'

      if (!this.$refs.items) return

      let center = {x: e.clientX, y: e.clientY}
      let closest = {dist: Infinity}

      for (let i = 0; i < this.$refs.items.length; i++) {
        let item = this.$refs.items[i]
        let dist = dist2D(elemCenter(item), center)
         if (dist && dist < closest.dist) closest = {dist, item}
      }

      let text = getData(e)
      this.dragging = text

      let cText = (closest.item || {}).textContent
      if (cText == text) return

      let curI = this.list.indexOf(text)
      let newI = this.list.indexOf(cText)

      if (newI == -1) newI = 0

      if (closest.item) {
        let c = elemCenter(closest.item)
        if (c.x < e.clientX && newI < this.list.length) newI++
      }
      if (curI == newI) return

      if (curI != -1 && newI < curI) this.list.splice(curI, 1)
      this.list.splice(newI, 0, text)
      if (curI != -1 && curI < newI) this.list.splice(curI, 1)
    },


    drop(e) {
      e.preventDefault()
      this.dragging = null
    },


    dragenter(e) {
      e.preventDefault()

      if (e.currentTarget.tagName != 'UL') return

      let text = getData(e)

      let i = this.list.indexOf(text)
      if (i == -1) this.list.push(text)
      this.dragging = text
    },

    dragleave(e) {
      if (!this.removable) return
      if (e.currentTarget.tagName != 'UL') return
      if (elemContains(e.currentTarget, e.clientX, e.clientY)) return

      let text = getData(e)

      let i = this.list.indexOf(text)
      if (i != -1) this.list.splice(i, 1)
      this.dragging = null
    },
  }
}
</script>

<template lang="pug">
ul.drag-list(@dragleave="dragleave", @dragenter="dragenter",
  @dragover="dragover", @drop="drop")
  li(v-for="item in list", draggable="true", @dragstart="dragstart",
    @dragend='dragend',
    ref="items", :class="{dragging: dragging == item}") {{item}}
</template>

<style lang="stylus">
ul.drag-list
  display flex
  gap calc(var(--gap) / 2)
  width 100%
  margin 0
  padding calc(var(--gap) / 2)
  border var(--border)
  border-radius var(--border-radius)
  background var(--table-header-bg)

  li
    cursor grab
    list-style none
    padding calc(var(--gap) / 2)
    border var(--border)
    border-radius var(--border-radius)
    background var(--panel-bg)

    &.dragging
      border-color var(--highlight-color)
</style>
