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
import * as THREE from 'three'
import InfiniteGridHelper from './viewer/InfiniteGridHelper.js'
import Sky from './viewer/Sky.js'

let HYDROGEN = 1
let CARBON   = 6
let NITROGEN = 7
let OXYGEN   = 8
let SULFUR   = 16
let HEAVY    = 999


function toRadians(angle) {return angle * (Math.PI / 180)}


export default {
  props: ['mach', 'unitID'],


  data() {
    return {
      message:   'Loading...',
      pause:     false,
      dragging:  false,
      draw_type: 1,
      wiggle:    false,
      frame:     0,
      last:      0,
    }
  },


  computed: {
    target()    {return this.$refs.canvas},
    viz()       {return this.mach.get_viz(this.unitID)},
    topology()  {return this.viz.topology},
    positions() {return this.viz.frames},
    frames()    {return this.positions ? this.positions.length : 0}
  },


  watch: {
    positions() {this.load()}
  },


  mounted() {
    this.$util.set_body_class(true, 'fullscreen')
    this.graphics()
    this.mach.visualize_unit(this.unitID)
    this.load()
  },


  unmounted() {
    this.mach.visualize_unit()
    window.removeEventListener('resize', this.update_view)
    window.removeEventListener('keyup',  this.on_key_up)
    window.cancelAnimationFrame(this.animate)
    this.renderer.dispose()
    this.$util.set_body_class(false, 'fullscreen')
  },


  methods: {
    close() {this.$router.back()},


    load() {
      this.draw()
      this.update_view()
      this.render()

      this.message = ''
      this.move_sun()
    },


    move_sun() {
      if (this.sky == undefined) return

      const r = 600
      const t = Date.now() / 200000
      let x = r * Math.cos(t)
      let y = 32 * Math.cos(t + 1.5) + 20
      let z = r * Math.sin(t)

      let u = this.sky.material.uniforms['sunPosition']
      u.value = new THREE.Vector3(x, y, z)

      setTimeout(this.move_sun, 100)
    },


    change_frame(frame) {
      if (this.positions == undefined || this.positions.length < 2) return
      if (this.positions.length <= frame) frame = 0
      if (frame < 0) frame = this.positions.length - 1

      let proteins = this.protein.children

      for (let i = proteins.length; i < this.positions.length; i++)
        this.protein.add(new THREE.Group)

      if (!proteins[frame].children.length)
        proteins[frame].add(this.draw_protein(frame, this.draw_type))

      proteins[this.frame].visible = false
      this.frame = frame
      proteins[this.frame].visible = true
    },


    next_frame() {this.change_frame(this.frame + 1)},
    prev_frame() {this.change_frame(this.frame - 1)},


    graphics() {
      try {
        // Renderer
        this.renderer = new THREE.WebGLRenderer({antialias: true, alpha: true})
        this.renderer.setPixelRatio(window.devicePixelRatio)
        this.target.appendChild(this.renderer.domElement)

      } catch (e) {
        console.log(e)
        alert('WebGL not supported')
        return
      }

      // Scene
      this.scene = new THREE.Scene
      this.scene.add(new InfiniteGridHelper)
      this.protein = new THREE.Group
      this.scene.add(this.protein)

      // Sky
      this.sky = new Sky
      this.scene.add(this.sky)

      // Camera
      this.camera = new THREE.PerspectiveCamera(45, 4 / 3, 0.1, 10000)

      // Lighting
      let ambient = new THREE.AmbientLight(0xffffff, 0.5)
      this.scene.add(ambient)

      let keyLight = new THREE.DirectionalLight(0xffeda5, 0.75)
      keyLight.position.set(-1, 0, 1)
      this.scene.add(keyLight)

      let fillLight = new THREE.DirectionalLight(0x8080ff, 0.25)
      fillLight.position.set(1, 0, 1)
      this.scene.add(fillLight)

      let backLight = new THREE.DirectionalLight(0xffffff, 0.5)
      backLight.position.set(1, 0, -1).normalize()
      this.scene.add(backLight)

      // Materials
      const shine = [10, 5, 6, 7, 7, 25]

      const specular = [
        0x727280, // Carbon
        0x333333, // Hydrogen
        0x333333, // Nitrogen
        0x333333, // Oxygen
        0x333333, // Sulfur
        0x3f803f, // Heavy atoms
      ]

      const color = [
        0x333333, // dark grey
        0x999999, // grey
        0x2020cc, // blue
        0xcc2626, // red
        0x999926, // yellow
        0x800099, // purple
      ]

      this.atom_materials = []
      for (let i = 0; i < specular.length; i++)
        this.atom_materials.push(
          new THREE.MeshPhongMaterial({
            shininess: shine[i], specular: specular[i], color: color[i]}))

      this.bond_material =
        new THREE.MeshPhongMaterial({
          shininess: 25,
          specular: 0x727280,
          color: 0xffffff,
          opacity: 0.6, transparent: true
        })

      // Events
      this.clock = new THREE.Clock()
      this.clock.start()

      window.addEventListener('resize', this.update_view, false)
      window.addEventListener('keyup',  this.on_key_up,   false)
      let e = this.renderer.domElement
      e.addEventListener('mousedown', this.on_mouse_down,  false)
      e.addEventListener('mouseup',   this.on_mouse_up,    false)
      e.addEventListener('mousemove', this.on_mouse_move,  false)
      e.addEventListener('wheel',     this.on_mouse_wheel, false)
    },


    render() {
      this.animate = window.requestAnimationFrame(this.render)
      if (this.scene == undefined) return

      if (!this.dragging && !this.pause) {
        let delta = this.clock.getDelta()
        this.rotate(-delta / 5, 0)

        if (this.wiggle) {
          this.last += delta
          if (0.1 < this.last) {
            this.last = 0
            this.next_frame()
          }
        }
      }

      this.renderer.render(this.scene, this.camera)
    },


    get_dims() {
      const width  = this.target.clientWidth
      const height = this.target.clientHeight
      return {width, height}
    },


    update_view() {
      let dims = this.get_dims()
      this.camera.aspect = dims.width / dims.height
      this.camera.updateProjectionMatrix()
      this.renderer.setSize(dims.width, dims.height)
    },


    atom_type_from_number(number) {
      switch (number) {
      case CARBON:   return 0
      case HYDROGEN: case 3:  return 1 // Hack to fix OpenMM 0x22 viz
      case NITROGEN: case 10: return 2 // Hack to fix OpenMM 0x22 viz
      case OXYGEN:   return 3
      case SULFUR:   return 4
      default:       return 5
      }
    },


    radius_from_type(type) {return 0.1 * [1.7, 1.09, 1.55, 1.52, 1.8, 2][type]},


    number_from_name(name) {
      if (!name.length) return HEAVY

      switch (name[0].toUpperCase()) {
      case 'H': return HYDROGEN
      case 'C': return CARBON
      case 'N': return NITROGEN
      case 'O': return OXYGEN
      case 'S': return SULFUR
      default:
        if (1 < name.length) return this.number_from_name(name.substr(1))
        return HEAVY
      }
    },


    get_atom_type(atom) {
      let number = atom[4] ? atom[4] : this.number_from_name(atom[0])
      return this.atom_type_from_number(number)
    },


    get_atom_geometry(atom_type, draw_type) {
      let radius = this.radius_from_type(atom_type)

      if (draw_type == 2) radius /= 3
      if (draw_type == 3) radius = 0.025

      // Scale resolution based on number of atoms
      let segs = (draw_type == 1 ? 2 : 1) * 8
      if (this.topology.atoms.length < 10000) segs *= 2
      if (this.topology.atoms.length < 1000)  segs *= 2

      return new THREE.SphereGeometry(radius, segs, segs)
    },


    draw_atoms(index, draw_type) {
      let group = new THREE.Group()

      // Count types
      let atom_types = [0, 0, 0, 0, 0, 0]
      let atoms = this.topology.atoms
      for (let i = 0; i < atoms.length; i++)
        atom_types[this.get_atom_type(atoms[i])]++

      // Create meshes
      let meshes = []
      for (let type = 0; type < atom_types.length; type++)
        if (atom_types[type]) {
          let mesh = new THREE.InstancedMesh(
            this.get_atom_geometry(type, draw_type), this.atom_materials[type],
            atom_types[type])

          meshes[type] = mesh
          group.add(mesh)
        }

      // Position atoms
      let pos = this.positions[index]
      const m = new THREE.Matrix4()
      atom_types = [0, 0, 0, 0, 0, 0]
      for (let i = 0; i < atoms.length; i++) {
        let type = this.get_atom_type(atoms[i])
        if (!meshes[type]) continue

        m.makeTranslation(pos[i][0], pos[i][1], pos[i][2])
        meshes[type].setMatrixAt(atom_types[type]++, m)
      }

      return group
    },


    get_bond_transform(a, b) {
      let vA = new THREE.Vector3(a[0], a[1], a[2])
      let vB = new THREE.Vector3(b[0], b[1], b[2])
      let length = vA.distanceTo(vB)

      let m = new THREE.Matrix4()
      m.makeTranslation(0, 0.5, 0)
      m.premultiply(new THREE.Matrix4().makeScale(1, length, 1))

      // Rotate
      let vec = vB.clone().sub(vA)
      let h = vec.length()
      vec.normalize()

      let q = new THREE.Quaternion()
      q.setFromUnitVectors(new THREE.Vector3(0, 1, 0), vec)

      m.premultiply(new THREE.Matrix4().makeRotationFromQuaternion(q))

      // Translate
      m.premultiply(new THREE.Matrix4().makeTranslation(vA.x, vA.y, vA.z))

      return m
    },


    draw_bonds(index) {
      let pos   = this.positions[index]
      let bonds = this.topology.bonds

      // Scale resolution based on number of atoms
      let segs = 4
      if (this.topology.atoms.length < 10000) segs *= 2
      if (this.topology.atoms.length < 1000)  segs *= 2

      let geometry = new THREE.CylinderGeometry(0.01, 0.01, 1, segs, 1, true)
      let mesh =
          new THREE.InstancedMesh(geometry, this.bond_material, bonds.length)

      // Set bond positions
      for (let i = 0; i < bonds.length; i++) {
        let a = pos[bonds[i][0]]
        let b = pos[bonds[i][1]]
        if (a != undefined && b != undefined)
          mesh.setMatrixAt(i, this.get_bond_transform(a, b))
      }

      return mesh
    },


    draw_protein(index, draw_type) {
      let group = new THREE.Group()

      group.add(this.draw_atoms(index, draw_type))

      if (draw_type == 2 || draw_type == 3)
        group.add(this.draw_bonds(index))

      // Find center
      let pos = this.positions[index]
      let center = new THREE.Vector3()
      for (let p of pos) center.add(new THREE.Vector3(p[0], p[1], p[2]))
      center.divideScalar(pos.length)

      // Translate to center
      group.translateX(-center.x)
      group.translateY(-center.y)
      group.translateZ(-center.z)

      return group
    },


    compute_bounds(index) {
      let bbox = new THREE.Box3(new THREE.Vector3, new THREE.Vector3)

      if (this.topology != undefined)
        for (let i = 0; i < this.topology.atoms.length; i++) {
          let p = this.positions[index][i]
          let v = new THREE.Vector3(p[0], p[1], p[2])

          bbox.expandByPoint(v)
        }

      return bbox
    },


    draw() {
      this.frame = 0
      this.protein.clear()

      if (this.positions != undefined && this.positions.length)
        this.protein.add(this.draw_protein(0, this.draw_type))

      if (!this.camera.position.z) {
        let bbox     = this.compute_bounds(0)
        let dims     = bbox.getSize(new THREE.Vector3())
        let maxDim   = Math.max(dims.x, dims.y, dims.z)
        let initialZ = maxDim / Math.tan(Math.PI * this.camera.fov / 360)
        let wDims    = this.get_dims()

        initialZ *= wDims.height / wDims.width / 1.5

        this.zoom_min = maxDim / 2.
        this.zoom_max = initialZ * 4

        this.camera.position.z = initialZ
      }
    },


    set_draw_type(type) {
      if (0 < type && type < 4 && this.draw_type != type) {
        let zoom = this.camera.position.z
        this.draw_type = type
        this.draw()
        this.camera.position.z = zoom
      }
    },


    on_key_up(e) {
      switch (e.key) {
      case ' ':
        this.pause = !this.pause
        this.clock.start()
        break

      case 'ArrowLeft':  this.prev_frame(); break
      case 'ArrowRight': this.next_frame(); break
      case 'ArrowUp':    this.zoom_in();    break
      case 'ArrowDown':  this.zoom_out();   break

      case 'w': this.wiggle = !this.wiggle; break

      case '1': case '2': case '3':
        this.set_draw_type(parseInt(e.key))
        break
      }
    },


    zoom(scale) {
      let z = this.camera.position.z * scale
      this.camera.position.z =
        Math.min(Math.max(z, this.zoom_min), this.zoom_max)
    },


    zoom_in() {this.zoom(0.95)},
    zoom_out() {this.zoom(1 / 0.95)},


    rotate(x, y) {
      let q = new THREE.Quaternion()
      q.setFromEuler(new THREE.Euler(y, x, 0, 'XYZ'))

      this.protein.quaternion.multiplyQuaternions(q, this.protein.quaternion)
    },


    on_mouse_down() {this.dragging = true},


    on_mouse_up() {
      this.dragging = false
      this.clock.start()
    },


    on_mouse_move(e) {
      if (this.dragging && this.previous)
        this.rotate(toRadians(e.offsetX - this.previous.x),
                    toRadians(e.offsetY - this.previous.y))

      this.previous = {x: e.offsetX, y: e.offsetY}
    },


    on_mouse_wheel(e) {
      if (e.deltaY < 0) this.zoom_in()
      else this.zoom_out()
    }
  }
}
</script>

<template lang="pug">
.visualization
  .canvas(ref="canvas")
    .message

  .controls.view-panel
    .control
      label View:
      each type in [1, 2, 3]
        Button(text=type, @click=`set_draw_type(${type})`,
          :disabled=`draw_type == ${type}`)

    .control
      label Frame:
      Button(@click="prev_frame", icon="chevron-left")
      span.frames {{frames ? frame + 1 : 0}} of {{frames}}
      Button(@click="next_frame", icon="chevron-right")

    .control
      Button(text="Close", icon="times", @click="close")
</template>

<style lang="stylus">
.visualization
  position fixed
  top 0
  left 0
  width 100vw
  height 100vh
  z-height 10
  display flex
  flex-direction column
  height 100%

  .canvas
    flex 1
    position relative

  .message
    position absolute
    width 100%
    line-height 200px
    text-align center
    font-size 200%

  .controls
    position absolute
    opacity 0.9
    padding var(--gap)
    top var(--gap)
    right var(--gap)
    display flex
    gap var(--gap)

    .control
      display flex
      gap var(--gap)
      white-space nowrap
      align-items center

      .frames
        font-family var(--mono-font)


@media (max-width 800px)
  .visualization .controls
    gap var(--gap)

    .fa-times + .button-content, label
      display none
</style>
