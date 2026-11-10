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


// Scratch objects, reused to avoid allocating per bond
const _pos   = new THREE.Vector3()
const _dir   = new THREE.Vector3()
const _scale = new THREE.Vector3(1, 1, 1)
const _up    = new THREE.Vector3(0, 1, 0)
const _quat  = new THREE.Quaternion()
const _mat   = new THREE.Matrix4()


export default {
  props: ['mach', 'unitID'],


  data() {
    return {
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
    frames()    {return this.positions ? this.positions.length : 0},
    atoms()     {return this.topology ? this.topology.atoms.length : 0},
    drawable()  {return !!(this.atoms && this.frames)},

    // Unbonded atoms, such as ions, can be spread across the whole simulation
    // box.  Center and frame the view on the bonded atoms only.
    body() {
      let bonds = this.topology ? this.topology.bonds : undefined
      if (!bonds || !bonds.length) return [...Array(this.atoms).keys()]

      let bonded = new Set
      for (let b of bonds) {bonded.add(b[0]); bonded.add(b[1])}
      return [...bonded]
    },

    // An empty topology means the core had nothing to visualize
    message() {
      if (!this.topology) return 'Loading...'
      if (!this.atoms) return 'No visualization available for this work unit'
      return this.frames ? '' : 'Loading...'
    }
  },


  watch: {
    positions() {this.load()},
    drawable()  {this.load()} // Boolean, so only fires on the 0 -> 1 frame edge
  },


  mounted() {
    this.$util.set_body_class(true, 'fullscreen')
    this.graphics()
    this.mach.visualize_unit(this.unitID)
    this.load()
    this.render()
    this.move_sun()
  },


  unmounted() {
    this.mach.visualize_unit()
    window.removeEventListener('resize', this.update_view)
    window.removeEventListener('keyup',  this.on_key_up)
    window.cancelAnimationFrame(this.animate)
    window.clearTimeout(this.sun_timer)
    this.dispose()
    this.$util.set_body_class(false, 'fullscreen')
  },


  methods: {
    close() {this.$router.back()},


    load() {
      if (this.scene == undefined) return
      this.draw()
      this.update_view()
    },


    clear_protein() {
      if (this.protein == undefined) return

      this.protein.traverse(o => {
        if (o.geometry)        o.geometry.dispose()
        if (o.isInstancedMesh) o.dispose()
      })

      this.protein.clear()
      this.atom_meshes = []
      this.bond_mesh   = undefined
    },


    dispose() {
      this.clear_protein()
      for (let m of this.atom_materials || []) m.dispose()
      if (this.bond_material) this.bond_material.dispose()
      if (this.renderer)      this.renderer.dispose()
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

      this.sun_timer = setTimeout(this.move_sun, 100)
    },


    change_frame(frame) {
      if (this.frames < 2) return
      if (this.frames <= frame) frame = 0
      if (frame < 0) frame = this.frames - 1

      this.frame = frame
      this.update_frame()
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
      if (this.scene == undefined) return
      this.animate = window.requestAnimationFrame(this.render)

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


    // Geometry depends only on the topology, so it is built once and each
    // frame just rewrites the instance transforms.  See update_frame().
    draw_atoms(draw_type) {
      let group = new THREE.Group()
      let atoms = this.topology.atoms

      // Count types
      let atom_types = [0, 0, 0, 0, 0, 0]
      for (let i = 0; i < atoms.length; i++)
        atom_types[this.get_atom_type(atoms[i])]++

      // Create meshes
      let meshes = []
      for (let type = 0; type < atom_types.length; type++)
        if (atom_types[type]) {
          let mesh = new THREE.InstancedMesh(
            this.get_atom_geometry(type, draw_type), this.atom_materials[type],
            atom_types[type])

          mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
          mesh.frustumCulled = false // Bounding sphere goes stale as it moves
          mesh.userData.atoms = []   // Which atom fills each instance slot
          meshes[type] = mesh
          group.add(mesh)
        }

      for (let i = 0; i < atoms.length; i++)
        meshes[this.get_atom_type(atoms[i])].userData.atoms.push(i)

      this.atom_meshes = meshes

      return group
    },


    // The cylinder origin is at its base, so this just places and stretches it.
    // Returns a shared matrix; copy it before the next call.
    get_bond_transform(a, b) {
      _pos.fromArray(a)
      _dir.fromArray(b).sub(_pos)

      let length = _dir.length()
      if (length) _quat.setFromUnitVectors(_up, _dir.divideScalar(length))
      else _quat.identity()

      _scale.set(1, length, 1)

      return _mat.compose(_pos, _quat, _scale)
    },


    draw_bonds() {
      // Scale resolution based on number of atoms
      let segs = 4
      if (this.topology.atoms.length < 10000) segs *= 2
      if (this.topology.atoms.length < 1000)  segs *= 2

      let geometry = new THREE.CylinderGeometry(0.01, 0.01, 1, segs, 1, true)
      geometry.translate(0, 0.5, 0) // Move origin to the base

      let mesh = new THREE.InstancedMesh(
        geometry, this.bond_material, this.topology.bonds.length)

      mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
      mesh.frustumCulled = false
      this.bond_mesh = mesh

      return mesh
    },


    draw_protein(draw_type) {
      let group = new THREE.Group()

      group.add(this.draw_atoms(draw_type))

      if (draw_type == 2 || draw_type == 3)
        group.add(this.draw_bonds())

      return group
    },


    // Point the shared meshes at the current frame
    update_frame() {
      let pos = this.positions[this.frame]
      if (pos == undefined) return

      // Center the protein
      let body   = this.body
      let center = new THREE.Vector3()
      for (let i of body) center.add(_pos.fromArray(pos[i]))
      center.divideScalar(body.length)
      this.protein.children[0].position.copy(center).negate()

      for (let mesh of this.atom_meshes) {
        if (mesh == undefined) continue
        let atoms = mesh.userData.atoms

        for (let i = 0; i < atoms.length; i++) {
          let p = pos[atoms[i]]
          mesh.setMatrixAt(i, _mat.makeTranslation(p[0], p[1], p[2]))
        }

        mesh.instanceMatrix.needsUpdate = true
      }

      if (this.bond_mesh == undefined) return

      let bonds = this.topology.bonds
      for (let i = 0; i < bonds.length; i++) {
        let a = pos[bonds[i][0]]
        let b = pos[bonds[i][1]]
        if (a != undefined && b != undefined)
          this.bond_mesh.setMatrixAt(i, this.get_bond_transform(a, b))
      }

      this.bond_mesh.instanceMatrix.needsUpdate = true
    },


    compute_bounds(index) {
      let bbox = new THREE.Box3 // Empty, so it does not always contain origin
      let pos  = this.positions[index]

      for (let i of this.body) bbox.expandByPoint(_pos.fromArray(pos[i]))

      return bbox
    },


    draw() {
      this.clear_protein()

      if (!this.drawable) return
      if (this.frames <= this.frame) this.frame = 0

      this.protein.add(this.draw_protein(this.draw_type))
      this.update_frame()

      if (!this.camera.position.z) {
        let bbox     = this.compute_bounds(0)
        let dims     = bbox.getSize(new THREE.Vector3())
        let maxDim   = Math.max(dims.x, dims.y, dims.z)
        let initialZ = maxDim / Math.tan(Math.PI * this.camera.fov / 360)
        let wDims    = this.get_dims()

        initialZ *= wDims.height / wDims.width / 1.5

        this.zoom_min = maxDim / 2.
        this.zoom_max = initialZ * 16

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
      if (this.zoom_min == undefined) return
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
    .message {{message}}

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
    padding 100px var(--gap)
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
