
import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { reactive, toRefs } from 'vue';
/* globals PerfectScrollbar, Chart, THREE */
var HYDROGEN = 1;
var CARBON   = 6;
var NITROGEN = 7;
var OXYGEN   = 8;
var SULFUR   = 16;
var HEAVY    = 999;

const graphics = reactive({
  draw_type: 1,
  pause_rotation: false,
  message: 'Loading...'
})

export default function useGraphicsLibrary() {

  var scene;
  var data_renderer;
  var clock = new THREE.Clock()
  var camera = null
  var ambient = null
  var lights = null
  var __zoom = null
  var rotate_startRot = undefined
  var rotate_startX = undefined
  var positions = null
  var topology = {}
  var _target = null
  var animate = null
  var protein = null
  var atom_materials = []
  var bond_material = null


  const showProtein = (topo, pos, root) => {
    topology = topo;
    positions = pos;
    data_renderer.domElement.style.display = 'block';
    draw();
    update_view();
    render();

    graphics.message = '';

    window.addEventListener('mousedown', mouse_down, false);
    window.addEventListener('keyup', key_up, false);
    window.addEventListener('wheel', wheel, false);
  }

  const removeGL = () => {
    window.removeEventListener('mousedown', mouse_down);
    window.removeEventListener('keyup', key_up);
    window.removeEventListener('wheel', wheel);
    window.removeEventListener('resize', update_view);
    window.cancelAnimationFrame(animate);
  }

  const clearArea = () => {
    if(data_renderer != 'undefined' && data_renderer.domElement != 'undefined')
      data_renderer.domElement.style.display = 'none';
  }

  const setGraphics = (root) => {
    try {
      _target = root;
      // Renderer
      data_renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
      data_renderer.setPixelRatio(window.devicePixelRatio);
      data_renderer.setClearColor(0, 0);

      _target.value.appendChild(data_renderer.domElement);

    } catch (e) {
      console.log(e);
      alert('WebGL not supported');
      return;
    }

    // Camera
    camera = new THREE.PerspectiveCamera(45, 4 / 3, 1, 1000);

    // Lighting
    ambient = new THREE.AmbientLight(0xffffff, 0.5);

    var keyLight = new THREE.DirectionalLight
    (new THREE.Color('hsl(30, 100%, 75%)'), 0.75);
    keyLight.position.set(-100, 0, 100);

    var fillLight = new THREE.DirectionalLight
    (new THREE.Color('hsl(240, 100%, 75%)'), 0.25);
    fillLight.position.set(100, 0, 100);

    var backLight = new THREE.DirectionalLight(0xffffff, 0.5);
    backLight.position.set(100, 0, -100).normalize();

    lights = new THREE.Group();
    lights.add(keyLight);
    lights.add(fillLight);
    lights.add(backLight);

    // Events
    window.addEventListener('resize', update_view, false);
  }


  const render = () => {
    animate = window.requestAnimationFrame(render);
    if (typeof scene == 'undefined') return;
    if (typeof rotate_startX == 'undefined' && !graphics.pause_rotation)
      protein.rotation.y += clock.getDelta() / 5;
    data_renderer.render(scene, camera);
  }


  const get_dims = () => {
    var t = _target.value.getBoundingClientRect();
    var width = t.width;
    var height = t.height;
    return {width: width, height: height};
  }


  const update_view = () => {
    var dims = get_dims();
    camera.aspect = dims.width / dims.height;
    camera.updateProjectionMatrix();
    data_renderer.setSize(dims.width, dims.height);
  }


  const make_materials = () => {
    var shine = [60, 20, 25, 30, 30, 100];

    var specular = [
      new THREE.Color(0.45, 0.45, 0.50), // Carbon
      new THREE.Color(0.20, 0.20, 0.20), // Hydrogen
      new THREE.Color(0.20, 0.20, 0.20), // Nitrogen
      new THREE.Color(0.20, 0.20, 0.20), // Oxygen
      new THREE.Color(0.20, 0.20, 0.20), // Sulfur
      new THREE.Color(0.25, 0.50, 0.25), // Heavy atoms
    ];

    var color = [
      new THREE.Color(0.20, 0.20, 0.20), // dark grey
      new THREE.Color(0.60, 0.60, 0.60), // grey
      new THREE.Color(0.10, 0.10, 0.80), // blue
      new THREE.Color(0.80, 0.15, 0.15), // red
      new THREE.Color(0.60, 0.60, 0.15), // yellow
      new THREE.Color(0.50, 0.00, 0.60), // purple
    ];

    var material = graphics.draw_type == 3 ? THREE.MeshPhysicalMaterial :
        THREE.MeshPhongMaterial;

    for (var i = 0; i < 6; i++) {
      if(graphics.draw_type == 3) atom_materials.push(new material({ color: color[i] }))
      else atom_materials.push(new material({ shininess: shine[i], specular: specular[i], color: color[i] }))
    }

    bond_material =
      new THREE.MeshPhongMaterial({
        shininess: 50,
        specular: new THREE.Color(0.45, 0.45, 0.50),
        color: new THREE.Color(1, 1, 1),
        opacity: 0.6, transparent: true
      })
  }


  const atom_type_from_number = (number) => {
    switch (number) {
    case HYDROGEN: return 0;
    case CARBON:   return 1;
    case NITROGEN: return 2;
    case OXYGEN:   return 3;
    case SULFUR:   return 4;
    default:       return 5;
    }
  }


  const radius_from_type = (type) => {
    return 0.1 * [1.2, 1.7, 1.55, 1.52, 1.8, 1][type];
  }


  const number_from_name = (name) => {
    if (!name.length) return HEAVY;

    switch (name[0].toUpperCase()) {
    case 'H': return HYDROGEN;
    case 'C': return CARBON;
    case 'N': return NITROGEN;
    case 'O': return OXYGEN;
    case 'S': return SULFUR;
    default:
      if (1 < name.length) return number_from_name(name.substr(1));
      return HEAVY;
    }
  }


  const get_atom = (atom) => {
    var number = atom[4] ? atom[4] : number_from_name(atom[0]);
    var type = atom_type_from_number(number);
    var radius = radius_from_type(type);

    if (graphics.draw_type == 1) radius /= 3;
    if (graphics.draw_type == 2) radius = 0.025;

    var segs = graphics.draw_type == 3 ? 20 : 8;

    return {
      number: number, type: type, radius: radius,
      geometry: new THREE.SphereGeometry(radius, segs, segs)
    }
  }


  const draw_atoms = () => {
    var group = new THREE.Group();
    var pos = positions;

    // Atoms
    var atom_geometries = [];
    for (var i = 0; i < 5; i++) atom_geometries.push([]);

    var atoms = topology.atoms;
    for (i = 0; i < atoms.length; i++) {
      var atom = get_atom(atoms[i]);
      var position = pos[i];
      atom.geometry.translate(position[0], position[1], position[2]);
      atom_geometries[atom.type].push(atom.geometry);
    }

    for (var type = 0; type < 5; type++) {
      if(atom_geometries[type].length == 0) continue;
      var geo = BufferGeometryUtils.mergeBufferGeometries(atom_geometries[type]);
      var mesh = new THREE.Mesh(geo, atom_materials[type]);
      group.add(mesh);
    }

    return group;
  }


  const get_bond_geometry = (a, b) => {
    var vA = new THREE.Vector3(a[0], a[1], a[2]);
    var vB = new THREE.Vector3(b[0], b[1], b[2]);
    var length = vA.distanceTo(vB);
    var r = 0.02;

    var geometry = new THREE.CylinderGeometry(r, r, length, 8, 1, true);
    geometry.translate(0, length / 2, 0);

    // Rotate
    var vec = vB.clone().sub(vA);
    var h = vec.length();
    vec.normalize();

    var q = new THREE.Quaternion();
    q.setFromUnitVectors(new THREE.Vector3(0, 1, 0), vec);

    var m = new THREE.Matrix4();
    m.makeRotationFromQuaternion(q);
    geometry.applyMatrix4(m);

    // Final translation
    geometry.translate(vA.x, vA.y, vA.z);

    return geometry;
  }


  const draw_bonds = () => {
    var group = new THREE.Group();
    var pos = positions;
    var bonds = topology.bonds;
    var bond_geometries = [];

    for (var i = 0; i < bonds.length; i++) {
      var a = pos[bonds[i][0]];
      var b = pos[bonds[i][1]];
      bond_geometries.push(get_bond_geometry(a, b));
    }

    var geometry = BufferGeometryUtils.mergeBufferGeometries(bond_geometries);

    return new THREE.Mesh(geometry, bond_material);
  }


  const draw_protein = () => {
    var group = new THREE.Group();

    group.add(draw_atoms());

    if (graphics.draw_type == 1 || graphics.draw_type == 2)
      group.add(draw_bonds());

    return group;
  }


  const draw = () => {
    make_materials();

    scene = new THREE.Scene();

    // Lights
    scene.add(ambient);
    scene.add(lights);

    // Model
    protein = draw_protein();
    protein.rotation.y = Math.PI * 45 / 180;
    scene.add(protein);

    var bbox = new THREE.Box3().setFromObject(protein);
    var center = bbox.getCenter(new THREE.Vector3());
    var dims = bbox.getSize(new THREE.Vector3());
    var maxDim = Math.max(dims.x, dims.y, dims.z);

    center.x -= dims.x * 0.1; // Shift right

    var initialZ = center.z +
        maxDim / 2 / Math.tan(Math.PI * camera.fov / 360);

    __zoom = {
      initial: initialZ,
      min: center.z + maxDim / 1.25,
      max: initialZ * 2
    }

    camera.position.x = center.x;
    camera.position.y = center.y;
    camera.position.z = initialZ;
    camera.lookAt(center);

  }


  const zoom = (delta) => {
    var totalZ = __zoom.max - __zoom.min;
    var z = camera.position.z + delta / totalZ * 10;
    if (z < __zoom.min) z = __zoom.min;
    if (__zoom.max < z) z = __zoom.max;
    camera.position.z = z;
  }


  const zoom_in = () => {zoom(-4)}
  const zoom_out = () => {zoom(4)}
  const wheel = (e) => {zoom(e.deltaY < 0 ? -1 : 1)}


  const rotate = (delta) => {
    var width = get_dims().width;
    protein.rotation.y =
      rotate_startRot + 2 * Math.PI * delta / width;
  }


  const mouse_move = (e) => {
    e.preventDefault();
    if (typeof rotate_startX != 'undefined')
      rotate(e.clientX - rotate_startX);
  }


  const mouse_down = (e) => {
    e.preventDefault();
    if (e.button == THREE.MOUSE.LEFT) {
      rotate_startX = e.clientX;
      rotate_startRot = protein.rotation.y;
      window.addEventListener('mousemove', mouse_move, false);
      window.addEventListener('mouseup', mouse_up, false);
    }
  }


  const mouse_up = (e) => {
    e.preventDefault();
    if (e.button == THREE.MOUSE.LEFT) {
      rotate_startX = undefined;
      clock.start();
      window.removeEventListener('mousemove', mouse_move, false);
      window.removeEventListener('mouseup', mouse_up, false);
    }
  }


  const set_draw_type = (type) => {
    if (0 < type && type < 4 && graphics.draw_type != type) {
      graphics.draw_type = type;
      var rotation = protein.rotation.y;
      var zoom = camera.position.z;
      draw();
      protein.rotation.y = rotation;
      camera.position.z = zoom;
      clock.start();
    }
  }

  const key_up = (e) => {set_draw_type(parseInt(e.key))}

  return { ...toRefs(graphics), showProtein, removeGL, setGraphics, clearArea, set_draw_type, rotate, zoom_in,
           zoom_out };
}
