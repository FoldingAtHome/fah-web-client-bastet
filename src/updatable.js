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

function is_object(o) {return o != null && typeof o === 'object'}


class Updatable {
  constructor(data) {Object.assign(this, Updatable.clean_keys(data))}


  static clean_key(key) {
    if (typeof key == 'string' && key.length <= 16)
      return key.replace('-', '_')
    return key
  }


  static clean_keys(data) {
    if (Array.isArray(data)) {
      let r = []

      for (const value of data)
        r.push(Updatable.clean_keys(value))

      return r
    }

    if (is_object(data)) {
      let r = {}

      for (const [key, value] of Object.entries(data))
        r[Updatable.clean_key(key)] = Updatable.clean_keys(value)

      return r
    }

    return data
  }


  do_update(update) {
    let obj = this
    let i = 0

    while (i < update.length - 2) {
      let key = Updatable.clean_key(update[i++])

      if (obj[key] == undefined)
        obj[key] = Number.isInteger(update[i]) ? [] : {}

      obj = obj[key]
    }

    let is_array = Array.isArray(obj)
    let key      = Updatable.clean_key(update[i++])
    let value    = update[i]

    if      (is_array && key   === -1)   obj.push(value)
    else if (is_array && key   === -2)   obj.splice(obj.length, 0, ...value)
    else if (is_array && value === null) obj.splice(key, 1)
    else if (value === null)             delete obj[key]
    else                                 obj[key] = value
  }
}

export default Updatable
