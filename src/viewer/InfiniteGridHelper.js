/******************************************************************************\

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

\******************************************************************************/

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

    const geometry = new THREE.PlaneGeometry(2, 2, 1, 1)
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
