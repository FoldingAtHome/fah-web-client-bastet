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

/**
 * @author zz85 / https://github.com/zz85
 *
 * Based on "A Practical Analytic Model for Daylight"
 * aka The Preetham Model, the de facto standard analytic skydome model
 * http://www.cs.utah.edu/~shirley/papers/sunsky/sunsky.pdf
 *
 * First implemented by Simon Wallner
 * http://www.simonwallner.at/projects/atmospheric-scattering
 *
 * Improved by Martin Upitis
 * http://blenderartists.org/forum/showthread.php?
 *   245954-preethams-sky-implementation-HDR
 *
 * Three.js integration by zz85 http://twitter.com/blurspline
 *
 * Node.js module implementation by Danila Loginov https://loginov.rocks
 */
import * as THREE from 'three'
import vertexShader   from './sky.vert?raw'
import fragmentShader from './sky.frag?raw'


class Sky extends THREE.Mesh {
  constructor() {
    const material = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      fragmentShader,
      vertexShader,
      uniforms: {
        luminance:       {value: 1},
        turbidity:       {value: 10},
        rayleigh:        {value: 2},
        mieCoefficient:  {value: 0.005},
        mieDirectionalG: {value: 0.8},
        sunPosition:     {value: new THREE.Vector3(-200, -3, -200)}
      }
    })

    super(new THREE.SphereGeometry(5000, 320, 150), material)
  }
}


export default Sky
