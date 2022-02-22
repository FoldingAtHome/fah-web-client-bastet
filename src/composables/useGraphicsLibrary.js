
import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { reactive, toRefs } from 'vue';
/* globals PerfectScrollbar, Chart, THREE */
let HYDROGEN = 1;
let CARBON   = 6;
let NITROGEN = 7;
let OXYGEN   = 8;
let SULFUR   = 16;
let HEAVY    = 999;

const graphics = reactive({
  draw_type: 1,
  pause_rotation: false,
  message: 'Loading'
})

export default function useGraphicsLibrary() {

  let scene;
  let data_renderer;
  let clock = new THREE.Clock()
  let camera = null
  let ambient = null
  let lights = null
  let __zoom = null
  let rotate_startRot = undefined
  let rotate_startX = undefined
  let positions = null
  let topology = {}
  let _target = null
  let animate = null
  let protein = null
  let atom_materials = []
  let bond_material = null


  const showProtein = (topo, pos, root) => {
    topology = topo;
    positions = pos;
    data_renderer.domElement.style.display = 'block';
    try {
      draw();
      update_view();
      render();
    } catch(e) {
      graphics.message = 'Empty Protein'
      return
    }

    graphics.message = '';

    window.addEventListener('mousedown', mouse_down, false);
    window.addEventListener('keyup', key_up, false);
    window.addEventListener('wheel', wheel, false);
    window.addEventListener('dblclick', togglePauseRotation);
  }

  const removeGL = () => {
    window.removeEventListener('mousedown', mouse_down);
    window.removeEventListener('keyup', key_up);
    window.removeEventListener('wheel', wheel);
    window.removeEventListener('dblclick', togglePauseRotation);
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

    let keyLight = new THREE.DirectionalLight
    (new THREE.Color('hsl(30, 100%, 75%)'), 0.75);
    keyLight.position.set(-100, 0, 100);

    let fillLight = new THREE.DirectionalLight
    (new THREE.Color('hsl(240, 100%, 75%)'), 0.25);
    fillLight.position.set(100, 0, 100);

    let backLight = new THREE.DirectionalLight(0xffffff, 0.5);
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
    let t = _target.value.getBoundingClientRect();
    let width = t.width;
    let height = t.height;
    return {width: width, height: height};
  }


  const update_view = () => {
    let dims = get_dims();
    camera.aspect = dims.width / dims.height;
    camera.updateProjectionMatrix();
    data_renderer.setSize(dims.width, dims.height);
  }


  const make_materials = () => {
    let shine = [60, 20, 25, 30, 30, 100];

    let specular = [
      new THREE.Color(0.45, 0.45, 0.50), // Carbon
      new THREE.Color(0.20, 0.20, 0.20), // Hydrogen
      new THREE.Color(0.20, 0.20, 0.20), // Nitrogen
      new THREE.Color(0.20, 0.20, 0.20), // Oxygen
      new THREE.Color(0.20, 0.20, 0.20), // Sulfur
      new THREE.Color(0.25, 0.50, 0.25), // Heavy atoms
    ];

    let color = [
      new THREE.Color(0.20, 0.20, 0.20), // dark grey
      new THREE.Color(0.60, 0.60, 0.60), // grey
      new THREE.Color(0.10, 0.10, 0.80), // blue
      new THREE.Color(0.80, 0.15, 0.15), // red
      new THREE.Color(0.60, 0.60, 0.15), // yellow
      new THREE.Color(0.50, 0.00, 0.60), // purple
    ];

    let material = graphics.draw_type == 3 ? THREE.MeshPhysicalMaterial :
        THREE.MeshPhongMaterial;

    for (let i = 0; i < 6; i++) {
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
    let number = atom[4] ? atom[4] : number_from_name(atom[0]);
    let type = atom_type_from_number(number);
    let radius = radius_from_type(type);

    if (graphics.draw_type == 1) radius /= 3;
    if (graphics.draw_type == 2) radius = 0.025;

    let segs = graphics.draw_type == 3 ? 20 : 8;

    return {
      number: number, type: type, radius: radius,
      geometry: new THREE.SphereGeometry(radius, segs, segs)
    }
  }


  const draw_atoms = () => {
    let group = new THREE.Group();
    let pos = positions;

    // Atoms
    let atom_geometries = [];
    for (let i = 0; i < 5; i++) atom_geometries.push([]);

    let atoms = topology.atoms;
    for (let i = 0; i < atoms.length; i++) {
      let atom = get_atom(atoms[i]);
      let position = pos[i];
      atom.geometry.translate(position[0], position[1], position[2]);
      atom_geometries[atom.type].push(atom.geometry);
    }

    for (let type = 0; type < 5; type++) {
      if(atom_geometries[type].length == 0) continue;
      let geo = BufferGeometryUtils.mergeBufferGeometries(atom_geometries[type]);
      let mesh = new THREE.Mesh(geo, atom_materials[type]);
      group.add(mesh);
    }

    return group;
  }


  const get_bond_geometry = (a, b) => {
    let vA = new THREE.Vector3(a[0], a[1], a[2]);
    let vB = new THREE.Vector3(b[0], b[1], b[2]);
    let length = vA.distanceTo(vB);
    let r = 0.02;

    let geometry = new THREE.CylinderGeometry(r, r, length, 8, 1, true);
    geometry.translate(0, length / 2, 0);

    // Rotate
    let vec = vB.clone().sub(vA);
    let h = vec.length();
    vec.normalize();

    let q = new THREE.Quaternion();
    q.setFromUnitVectors(new THREE.Vector3(0, 1, 0), vec);

    let m = new THREE.Matrix4();
    m.makeRotationFromQuaternion(q);
    geometry.applyMatrix4(m);

    // Final translation
    geometry.translate(vA.x, vA.y, vA.z);

    return geometry;
  }


  const draw_bonds = () => {
    let group = new THREE.Group();
    let pos = positions;
    let bonds = topology.bonds;
    let bond_geometries = [];

    for (let i = 0; i < bonds.length; i++) {
      let a = pos[bonds[i][0]];
      let b = pos[bonds[i][1]];
      bond_geometries.push(get_bond_geometry(a, b));
    }

    let geometry = BufferGeometryUtils.mergeBufferGeometries(bond_geometries);

    return new THREE.Mesh(geometry, bond_material);
  }


  const draw_protein = () => {
    let group = new THREE.Group();

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

    let bbox = new THREE.Box3().setFromObject(protein);
    let center = bbox.getCenter(new THREE.Vector3());
    let dims = bbox.getSize(new THREE.Vector3());
    let maxDim = Math.max(dims.x, dims.y, dims.z);

    center.x -= dims.x * 0.1; // Shift right

    let initialZ = center.z +
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
    let totalZ = __zoom.max - __zoom.min;
    let z = camera.position.z + delta / totalZ * 10;
    if (z < __zoom.min) z = __zoom.min;
    if (__zoom.max < z) z = __zoom.max;
    camera.position.z = z;
  }


  const zoom_in = () => {zoom(-4)}
  const zoom_out = () => {zoom(4)}
  const wheel = (e) => {zoom(e.deltaY < 0 ? -1 : 1)}


  const rotate = (delta) => {
    let width = get_dims().width;
    protein.rotation.y =
      rotate_startRot + 2 * Math.PI * delta / width;
  }

  const togglePauseRotation = () => { graphics.pause_rotation = !graphics.pause_rotation; }

  const mouse_move = (e) => {
    e.preventDefault();
    if (typeof rotate_startX != 'undefined')
      rotate(e.clientX - rotate_startX);
  }


  const mouse_down = (e) => {
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
      let rotation = protein.rotation.y;
      let zoom = camera.position.z;
      draw();
      protein.rotation.y = rotation;
      camera.position.z = zoom;
      clock.start();
    }
  }

  const key_up = (e) => {
    if(e.code === 'Space') togglePauseRotation();
    if(e.key === '-') zoom_out();
    if(e.key === '+') zoom_in();
    set_draw_type(parseInt(e.key))
  }

  return { ...toRefs(graphics), showProtein, removeGL, setGraphics, clearArea, set_draw_type, rotate, zoom_in,
           zoom_out };
}
