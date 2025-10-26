/*******************************************************************************
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
*******************************************************************************/

import Util   from './util.js'
import Matrix from './matrix.js'


const util = new Util

const default_config = {
  marker:  {stroke: '#fff', enabled: true},
  labels:  {
    enabled: true,
    family:  'mono',
    stroke:  '#00c3fa',
    opacity: 1,
    size:    12,
  },
  grid:    {
    stroke: '#00c3fa',
    opacity: 0.2,
    width:   1
  },
  line:    {enabled: true, width: 1.25},
  point:   {enabled: false},
  offsets: {left: 30, right: 0, top: 0, bottom: 16},

  columns() {return []},
  rows()    {return []},
  coords()  {},
}


function defVal(value, def) {return value == undefined ? def : value}


function render_common(ctx, e) {
  ctx.globalAlpha = defVal(e.opacity, 1) / 2
  ctx.strokeStyle = defVal(e.stroke,  '#fff')
  ctx.fillStyle   = defVal(e.fill,    'none')
}


function render_path(ctx, p) {
  if (!p.points.length) return

  render_common(ctx, p)
  ctx.lineWidth = defVal(p.width, 1)
  ctx.lineJoin  = defVal(p.join,  'round')

  ctx.beginPath()
  ctx.moveTo(p.points[0].x, p.points[0].y)
  for (let pt of p.points) ctx.lineTo(pt.x, pt.y)
  ctx.stroke()
}


function render_circle(ctx, c) {
  render_common(ctx, c)
  ctx.lineWidth = defVal(c.width, 1)

  ctx.beginPath()
  ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2)
  ctx.stroke()
}


function render_text(ctx, t) {
  let family = defVal(t.family, 'serif')
  let style  = defVal(t.style,  'normal')
  let weight = defVal(t.weight, 'normal')
  let size   = defVal(t.size,   12)

  ctx.font         = [style, weight, size + 'px', + family].join(' ')
  ctx.textAlign    = defVal(t.align,     'center')
  ctx.textBaseline = defVal(t.baseline,  'middle')
  ctx.direction    = defVal(t.direction, 'inherit')
  ctx.fillStyle    = defVal(t.stroke,    '#fff')
  render_common(ctx, t)

  ctx.fillText(t.text, t.x, t.y)
}


function render_group(ctx, group) {
  for (let e of group) {
    if (e.enabled === false) continue
    if (Array.isArray(e)) render_group(ctx, e)
    else switch (e.type) {
    case 'path':   render_path(ctx, e);   break
    case 'circle': render_circle(ctx, e); break
    case 'text':   render_text(ctx, e);   break
    default: console.error('Unknown render type', e)
    }
  }
}


class Chart {
  constructor(canvas, config = {}, series = []) {
    this.canvas = canvas
    this.config = util.deepCopy(default_config)
    this.series = series || []

    util.merge_objs(this.config, config || {})

    for (let method of [
      'redraw', 'restart', 'on_resize', 'on_mousemove', 'on_mouseleave'])
      this.bind(method)

    this.restart      = util.debounce(this.restart,      100)
    this.on_resize    = util.debounce(this.on_resize,    100)
    this.on_mousemove = util.debounce(this.on_mousemove,  50)

    this.resizeObserver = new ResizeObserver(this.on_resize)
  }


  get width()  {return this.config.width  || this.canvas.clientWidth}
  get height() {return this.config.height || this.canvas.clientHeight}


  bind(method) {return this[method] = this[method].bind(this)}


  compute_dims() {
    let series = this.series.filter(s => s.enabled)

    // Min
    this.min = {
      x: series.reduce((min, s) => Math.min(s.min.x, min), Infinity),
      y: series.reduce((min, s) => Math.min(s.min.y, min), Infinity)
    }

    // Max
    this.max = {
      x: series.reduce((max, s) => Math.max(s.max.x, max), -Infinity),
      y: series.reduce((max, s) => Math.max(s.max.y, max), -Infinity)
    }

    // Scale
    const off  = this.config.offsets
    this.scale = {
      x: (this.width  - off.left - off.right)  / (this.max.x - this.min.x),
      y: (this.height - off.top  - off.bottom) / (this.min.y - this.max.y)
    }

    // Matrix
    let m = this.matrix = new Matrix
    m.translate(off.left, off.top)
    m.scale(this.scale.x, this.scale.y)
    m.translate(-this.min.x, -this.max.y)

    // Inverse
    this.inverse = m.inverse() || new Matrix
  }


  stop() {
    if (!this.active) return
    this.active = false

    // Events
    this.canvas.removeEventListener('mousemove',  this.on_mousemove)
    this.canvas.removeEventListener('mouseleave', this.on_mouseleave)
    this.resizeObserver.disconnect()

    delete this.marker
  }


  start() {
    if (this.active) return
    this.active = true

    // Save dims
    this._width  = this.width
    this._height = this.height

    this.marker = []

    // Events
    this.canvas.addEventListener('mousemove',  this.on_mousemove)
    this.canvas.addEventListener('mouseleave', this.on_mouseleave)
    this.resizeObserver.observe(this.canvas)

    this.redraw()
  }


  render() {
    if (!this.active) return

    let ctx = this.canvas.getContext('2d')

    this.canvas.width  = this.width
    this.canvas.height = this.height
    ctx.clearRect(0, 0, this.width, this.height)

    render_group(ctx, this.scene)
    ctx.translate(0.125, 0.125)
    render_group(ctx, this.scene)
  }


  update() {
    cancelAnimationFrame(this.aframe)
    this.aframe = requestAnimationFrame(() => this.render())
  }


  restart() {
    this.stop()
    this.start()
  }


  draw_marker() {
    let group = this.marker
    this.marker.length = 0

    if (this.nearest == undefined || !this.config.marker.enabled)
      return group

    const p = this.matrix.mul2d(this.nearest)

    if (p != undefined) {
      let c = {type: 'circle', x: p.x, y: p.y, r: 2}
      util.copy_props(c, this.config.marker)
      group.push(c)

      let off = this.config.offsets
      let l = {
        type: 'path',
        points: [{x: p.x, y: off.top}, {x: p.x, y: this.height - off.bottom}]
      }
      util.copy_props(l, this.config.marker)
      group.push(l)
    }

    return group
  }


  draw_grid() {
    let group = []
    let off = this.config.offsets

    // Columns
    let width = this.width - off.left - off.right
    let cols  = this.config.columns(this.min.x, this.max.x, width)

    for (let col of cols) {
      let x = this.matrix.mul2d({x: col.col, y: 0}).x
      let l = {
        type: 'path',
        points: [{x, y: off.top}, {x, y: this.height - off.bottom}]
      }
      util.copy_props(l, this.config.grid)
      group.push(l)

      if (this.config.labels.enabled) {
        let t = {
          type: 'text', text: col.text, x, y: this.height - off.bottom + 4,
          baseline: 'top'}
        util.copy_props(t, this.config.labels)

        group.push(t)
      }
    }

    // Rows
    let height = this.height - off.top - off.bottom
    let rows   = this.config.rows(this.min.y, this.max.y, height)

    for (let row of rows) {
      let y = this.matrix.mul2d({x: 0, y: row.row}).y
      let l = {
        type: 'path',
        points: [{x: off.left, y}, {x: this.width - off.right, y}]
      }
      util.copy_props(l, this.config.grid)
      group.push(l)

      if (this.config.labels.enabled) {
        let t = {type: 'text', text: row.text, x: off.left - 4, y}
        util.copy_props(t, this.config.labels)
        t.align = 'right'
        group.push(t)
      }
    }

    return group
  }


  draw_series(s) {
    if (!s.enabled) return []

    let group  = []
    let points = []

    for (let e of s.data) {
      let p = this.matrix.mul2d(e)
      points.push(p)

      if (this.config.point.enabled) {
        let point = {type: 'circle', x: p.x, y: p.y, r: 1}
        util.copy_props(point, this.config.point)
        point.stroke = s.color
        group.push(point)
      }
    }

    let line = {type: 'path', points}
    util.copy_props(line, this.config.line)
    line.stroke = s.color
    line.fill   = 'none'
    group.push(line)

    return group
  }


  redraw() {
    if (!this.active) return

    this.compute_dims()
    if (!isFinite(this.scale.x) || !isFinite(this.scale.y)) return

    let group = this.scene = []

    // Grid
    group.push(this.draw_grid())

    // Series
    for (let s of this.series)
      group.push(this.draw_series(s))

    // Marker
    group.push(this.draw_marker())

    this.update()
  }


  find_nearest_point(target) {
    target = this.inverse.mul2d(target)
    let nearest

    for (let s of this.series) {
      if (s.enabled === false) continue

      let e = s.find_nearest_x(target.x)
      if (e == undefined) continue

      if (nearest == undefined || util.is_closer(e.y, nearest.y, target.y))
        nearest = {x: e.x, y: e.y, series: s}
    }

    return nearest
  }


  on_resize() {
    if (!this.active) return
    if (this._width != this.width || this._height != this.height)
      this.restart()
  }


  on_mousemove(event) {
    if (!this.active) return
    let pt = {x: event.offsetX, y: event.offsetY}
    if (!pt.x && !pt.y) return
    this.nearest = this.find_nearest_point(pt)
    if (this.nearest == undefined) return
    this.config.coords(this.nearest)
    this.draw_marker()
    this.update()
  }


  on_mouseleave(event) {
    this.nearest = undefined
    this.draw_marker()
    this.update()
  }
}


export default Chart