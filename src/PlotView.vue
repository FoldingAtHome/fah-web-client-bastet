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
class Grid {
  constructor(canvas, size, gap) {
    this.width  = canvas.width  = canvas.offsetWidth
    this.height = canvas.height = canvas.offsetHeight

    this.canvas = canvas
    this.size   = size
    this.gap    = gap

    this.xStep  = size + gap
    this.yStep  = size + gap * 1.125
    this.cols   = Math.ceil(this.width  / this.xStep)
    this.rows   = Math.ceil(this.height / this.yStep)

    this.ctx    = canvas.getContext('2d')
    this.img    = this.ctx.getImageData(0, 0, this.width, this.height)

    this.ctx.imageSmoothingEnabled = false
  }


  _put(x, y, c) {
    if (x < 0 || this.width <= x || y < 0 || this.height <= y)
      return

    x = this.width  - x - 1
    y = this.height - y - 1

    let offset = (x + y * this.width) * 4

    for (let i = 0; i < c.length; i++)
      this.img.data[offset + i] = c[i] * 255
  }


  put(x, y, c) {
    for (let i = 0; i < this.size; i++)
      for (let j = 0; j < this.size; j++)
        this._put(Math.floor(x * this.xStep) + i,
          Math.floor(y * this.yStep) + j, c)
  }


  draw() {this.ctx.putImageData(this.img, 0, 0)}
}


export default {
  name: 'PlotView',


  props: {
    x:   Number,
    min: Number,
  },


  data() {
    return {
      data: []
    }
  },


  mounted()   {this.start()},
  unmounted() {this.stop()},


  methods: {
    start() {this.measure()},
    stop()  {clearTimeout(this.timer)},


    measure() {
      this.timer = setTimeout(() => this.measure(), 1000)
      this.data.push(this.x)
      this.draw()
    },


    draw() {
      let grid = new Grid(this.$el, 2, 2)
      let data = this.data

      if (grid.cols < this.data.length)
        data.splice(0, data.length - grid.cols)

      let max = data.reduce((max, x) => max < x ? x : max, this.min)
      data    = data.map(x => x / max)

      for (let x = 0; x < grid.cols; x++)
        if (x < data.length)
          for (let y = 0; y < grid.rows; y++)
            if (y / grid.rows < data[data.length - x - 1]) {
              let c = 0.66 * y / grid.rows + 0.33
              grid.put(x, y, [0, c, c, 1])
            }

      grid.draw()
    }
  }
}
</script>

<template lang="pug">
canvas.plot-view
</template>

<style lang="stylus">
.plot-view
  display flex
</style>
