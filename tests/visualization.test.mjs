import assert from 'node:assert/strict'
import {readFile} from 'node:fs/promises'
import test from 'node:test'
import * as THREE from 'three'
import {parse} from '@vue/compiler-sfc'

// Exercise the component's real transforms without requiring a WebGL context.
const url = new URL('../src/Visualization.vue', import.meta.url)
const {descriptor} = parse(await readFile(url, 'utf8'))
const script = descriptor.script.content
  .replace(/^import (InfiniteGridHelper|Sky) .+$/gm, '')
  .replace("from 'three'", `from '${import.meta.resolve('three')}'`)
const {default: component} = await import(
  'data:text/javascript;base64,' + Buffer.from(script).toString('base64'))

function setup(count = 3) {
  const viz = {
    topology: {atoms: [['C'], ['N']], bonds: [[0, 1]]},
    frames: Array.from({length: count}, (_, i) => [[10, 2, 0], [12, 2 + i, 0]])
  }
  const vm = {...component.data(),
    mach: {get_viz: () => viz},
    $refs: {canvas: {clientWidth: 1200, clientHeight: 800}},
    camera: new THREE.PerspectiveCamera(45, 1.5, 0.1, 10000),
    protein: new THREE.Group(), scene: new THREE.Scene(),
    renderer: {setSize() {}, render() {}},
    atom_materials: Array.from({length: 6}, () => new THREE.MeshPhongMaterial()),
    bond_material: new THREE.MeshPhongMaterial()
  }
  for (const [name, method] of Object.entries(component.methods))
    vm[name] = method.bind(vm)
  for (const [name, getter] of Object.entries(component.computed))
    Object.defineProperty(vm, name, {get: getter.bind(vm)})
  vm.load()
  return {vm, viz}
}

function close(actual, expected) {
  assert.ok(Math.abs(actual - expected) < 1e-6, `${actual} != ${expected}`)
}

test('animation advances at two source frames per second and reverses at both ends', () => {
  const {vm} = setup()
  vm.advance_animation(0.25)
  close(vm.cursor, 0.5)
  vm.advance_animation(0.75)
  close(vm.cursor, 2)
  assert.equal(vm.direction, -1)
  vm.advance_animation(0.25)
  close(vm.cursor, 1.5)
  vm.advance_animation(0.75)
  close(vm.cursor, 0)
  assert.equal(vm.direction, 1)
  vm.advance_animation(8.25)
  close(vm.cursor, 0.5)
})

test('interpolated atoms and bonds agree; source data and geometry are unchanged', () => {
  const {vm, viz} = setup()
  const original = JSON.stringify(viz.frames)
  vm.set_draw_type(2)
  const mesh = vm.atom_meshes[2]
  const geometry = mesh.geometry
  const bonds = vm.bond_mesh
  vm.advance_animation(0.25)
  const matrix = new THREE.Matrix4()
  mesh.getMatrixAt(0, matrix)
  assert.deepEqual(new THREE.Vector3().setFromMatrixPosition(matrix).toArray(), [12, 2.5, 0])
  bonds.getMatrixAt(0, matrix)
  const start = new THREE.Vector3(0, 0, 0).applyMatrix4(matrix)
  const end = new THREE.Vector3(0, 1, 0).applyMatrix4(matrix)
  assert.deepEqual(start.toArray(), [10, 2, 0])
  close(end.x, 12)
  close(end.y, 2.5)
  assert.deepEqual(vm.protein.children[0].position.toArray(), [-11, -2.25, -0])
  vm.advance_animation(0.5)
  assert.equal(vm.atom_meshes[2].geometry, geometry)
  assert.equal(vm.bond_mesh, bonds)
  assert.equal(JSON.stringify(viz.frames), original)
})

test('manual stepping pauses animation on exact source frames, including wraparound', () => {
  const {vm} = setup()
  vm.advance_animation(0.25)
  vm.next_frame()
  assert.equal(vm.animation, false)
  assert.equal(vm.cursor, 1)
  assert.equal(vm.display_positions[1].y, 3)
  vm.prev_frame()
  vm.prev_frame()
  assert.equal(vm.frame, 2)
  vm.next_frame()
  assert.equal(vm.frame, 0)
  vm.toggle_animation()
  assert.equal(vm.animation, true)
})

test('OFF freezes the interpolated pose while rotation remains independent', () => {
  const {vm} = setup()
  const previousWindow = globalThis.window
  globalThis.window = {requestAnimationFrame: () => 1}
  try {
    vm.clock = {getDelta: () => 0.05}
    vm.render()
    vm.toggle_animation()
    const cursor = vm.cursor
    const pose = vm.display_positions.map(p => p.toArray())
    const rotation = vm.protein.quaternion.clone()
    vm.render()
    assert.equal(vm.cursor, cursor)
    assert.deepEqual(vm.display_positions.map(p => p.toArray()), pose)
    assert.ok(!vm.protein.quaternion.equals(rotation))
    vm.pause = true
    vm.toggle_animation()
    vm.render()
    assert.ok(vm.cursor > cursor)
  } finally {globalThis.window = previousWindow}
})

test('data reloads do not start extra render loops and preserve frame, rotation and zoom', () => {
  const {vm, viz} = setup()
  vm.advance_animation(0.25)
  vm.rotate(0.2, 0.3)
  vm.zoom_in()
  const rotation = vm.protein.quaternion.clone()
  const zoom = vm.camera.position.z
  vm.render = () => assert.fail('load must not start a render loop')
  vm.move_sun = () => assert.fail('load must not start a sun timer')
  let disposed = 0
  vm.atom_meshes[0].geometry.addEventListener('dispose', () => disposed++)
  viz.frames.push([[10, 2, 0], [12, 5, 0]])
  vm.load()
  assert.equal(disposed, 1)
  vm.set_draw_type(3)
  close(vm.cursor, 0.5)
  assert.equal(vm.camera.position.z, zoom)
  assert.ok(vm.protein.quaternion.equals(rotation))
  viz.frames = viz.frames.slice(0, 1)
  vm.load()
  assert.equal(vm.frame, 0)
  assert.equal(vm.cursor, 0)
})

test('missing, single-frame and coincident-atom data remain safe', () => {
  const {vm, viz} = setup(0)
  vm.zoom_in()
  vm.advance_animation(1)
  vm.next_frame()
  vm.toggle_animation()
  assert.equal(vm.frame, 0)
  assert.ok(Number.isFinite(vm.camera.position.z))
  viz.frames = [[[10, 2, 0], [10, 2, 0]]]
  vm.load()
  vm.set_draw_type(2)
  vm.advance_animation(1)
  assert.equal(vm.cursor, 0)
  assert.ok(Array.from(vm.bond_mesh.instanceMatrix.array).every(Number.isFinite))
  assert.ok(vm.camera.position.z > 0)
})

test('zoom reaches closer and farther without crossing clipping limits', () => {
  const {vm} = setup()
  const initial = vm.camera.position.z
  vm.zoom(1e-9)
  assert.equal(vm.camera.position.z, vm.zoom_min)
  assert.ok(vm.zoom_min < 2 / 2)
  assert.ok(vm.camera.near < vm.zoom_min)
  vm.zoom(1e12)
  assert.equal(vm.camera.position.z, vm.zoom_max)
  assert.ok(vm.zoom_max > initial * 16)
  assert.ok(vm.camera.far > vm.zoom_max + 2)
})

test('closing cancels animation and sun updates and releases protein resources', () => {
  const {vm} = setup()
  const previousWindow = globalThis.window
  const cancelled = []
  const disposed = []
  globalThis.window = {
    removeEventListener() {},
    cancelAnimationFrame: id => cancelled.push(id),
    clearTimeout: id => cancelled.push(id)
  }
  try {
    vm.animate = 123
    vm.sun_timer = 456
    vm.mach.visualize_unit = () => {}
    vm.$util = {set_body_class() {}}
    vm.renderer.dispose = () => disposed.push('renderer')
    vm.atom_meshes[0].geometry.addEventListener('dispose', () => disposed.push('geometry'))
    vm.atom_materials[0].addEventListener('dispose', () => disposed.push('material'))
    component.unmounted.call(vm)
    assert.deepEqual(cancelled, [123, 456])
    assert.deepEqual(disposed, ['geometry', 'material', 'renderer'])
    assert.equal(vm.protein.children.length, 0)
  } finally {globalThis.window = previousWindow}
})
