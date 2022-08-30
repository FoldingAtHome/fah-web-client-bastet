// Author: Fyrestar https://mevedia.com
// (https://github.com/Fyrestar/THREE.InfiniteGridHelper)
import * as THREE from 'three'
import vertexShader   from './grid.vert?raw'
import fragmentShader from './grid.frag?raw'


class InfiniteGridHelper extends THREE.Mesh {
  constructor(size1 = 10, size2 = 100, color = new THREE.Color('#888'),
              distance = 8000) {
    const matrix =
          new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0, 1, 0), 1)
    matrix.premultiply(new THREE.Matrix4().makeTranslation(0, -100, 0))

    const geometry = new THREE.PlaneBufferGeometry(2, 2, 1, 1)
    const material = new THREE.ShaderMaterial({
      side: THREE.DoubleSide,
      transparent: true,
      vertexShader,
      fragmentShader,
      extensions: {derivatives: true},
      uniforms: {
        uMatrix: new THREE.Uniform(matrix),
        uSize1: {value: size1},
        uSize2: {value: size2},
        uColor: {value: color},
        uDistance: {value: distance}
      }
    })

    super(geometry, material)
    this.frustumCulled = false
  }
}

export default InfiniteGridHelper
