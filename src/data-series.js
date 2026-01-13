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

import {reactive} from 'vue'


class DataSeries {
  constructor(color, enabled = true) {
    this.color   = color
    this.enabled = enabled
    this.state   = reactive({
      data: [],
      min:  {x:  Infinity, y:  Infinity},
      max:  {x: -Infinity, y: -Infinity},
    })
  }


  get data() {return this.state.data}
  get max()  {return this.state.max}
  get min()  {return this.state.min}


  add(data) {
    this.state.data.push(data)

    this.state.min.x = Math.min(this.state.min.x, data.x)
    this.state.max.x = Math.max(this.state.max.x, data.x)
    this.state.min.y = Math.min(this.state.min.y, data.y)
    this.state.max.y = Math.max(this.state.max.y, data.y)
  }


  find_nearest_x(x) {
    let data = this.state.data
    if (!data.length) return

    let i = this._find_index(data, x, 0, data.length)

    if (i == data.length) return data[i - 1]
    if (i == 0)           return data[0]
    return data[x - data[i - 1].x < data[i].x - x ? i - 1 : i]
  }


  _find_index(data, x, min, max) {
    let len = max - min

    if (len == 1) return data[min].x < x ? min + 1 : min

    let mid = Math.floor(len / 2) + min

    if (x < data[mid].x) return this._find_index(data, x, min, mid)
    return this._find_index(data, x, mid, max)
  }
}


export default DataSeries
