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

class Matrix {
  constructor(m = [1, 0, 0, 0, 1, 0, 0, 0, 1]) {this.m = m}


  clone() {return new Matrix(this.m)}


  mul2d(v) {
    return {
      x: this.m[0] * v.x + this.m[1] * v.y + this.m[2],
      y: this.m[3] * v.x + this.m[4] * v.y + this.m[5],
    }
  }


  multiply(m) {
    const a = this.m
    const b = m instanceof Matrix ? m.m : m

    this.m = [
      a[0] * b[0] + a[1] * b[3] + a[2] * b[6],
      a[0] * b[1] + a[1] * b[4] + a[2] * b[7],
      a[0] * b[2] + a[1] * b[5] + a[2] * b[8],
      a[3] * b[0] + a[4] * b[3] + a[5] * b[6],
      a[3] * b[1] + a[4] * b[4] + a[5] * b[7],
      a[3] * b[2] + a[4] * b[5] + a[5] * b[8],
      a[6] * b[0] + a[7] * b[3] + a[8] * b[6],
      a[6] * b[1] + a[7] * b[4] + a[8] * b[7],
      a[6] * b[2] + a[7] * b[5] + a[8] * b[8],
    ]
  }


  rotate(a) {
    const c = cos(n), s = sin(n)
    this.multiply([c, -s, 0, s, c, 0, 0, 0, 1])
  }


  translate(x = 0, y = 0) {this.multiply([1, 0, x, 0, 1, y, 0, 0, 1])}
  scale    (x = 1, y = 1) {this.multiply([x, 0, 0, 0, y, 0, 0, 0, 1])}


  inverse() {
    let m = this.m

    let b = [
       m[8] * m[4] - m[5] * m[7],
      -m[8] * m[1] + m[2] * m[7],
       m[5] * m[1] - m[2] * m[4],
      -m[8] * m[3] + m[5] * m[6],
       m[8] * m[0] - m[2] * m[6],
      -m[5] * m[0] + m[2] * m[3],
       m[7] * m[3] - m[4] * m[6],
      -m[7] * m[0] + m[1] * m[6],
       m[4] * m[0] - m[1] * m[3],
    ]

    let det = m[0] * b[0] + m[1] * b[3] + m[2] * b[6]
    if (!det) return
    det = 1.0 / det

    return new Matrix(b.map(x => x * det))
  }
}

export default Matrix
