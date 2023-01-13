/******************************************************************************\

                  This file is part of the Folding@home Client.

          The fah-client runs Folding@home protein folding simulations.
                    Copyright (c) 2001-2023, foldingathome.org
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

class Cookie {
  constructor(prefix = 'fah-client-') {
    this.prefix = prefix
  }


  _get(name, defaultValue) {
    let decodedCookie = decodeURIComponent(document.cookie)
    let ca = decodedCookie.split(';')
    name = this.prefix + name + '='

    for (let i = 0; i < ca.length; i++) {
      let c = ca[i]
      while (c.charAt(0) == ' ') c = c.substring(1)
      if (!c.indexOf(name)) return c.substring(name.length, c.length)
    }

    return defaultValue
  }


  _set(name, value, days) {
    let offset = 2147483647 // Max value
    if (typeof days != 'undefined') offset = days * 24 * 60 * 60 * 1000
    let d = new Date()
    d.setTime(d.getTime() + offset)
    let expires = 'expires=' + d.toUTCString()
    document.cookie =
      this.prefix + name + '=' + value + ';' + expires +
      ';path=/;samesite=lax'
  }


  get(name, defaultValue) {
    let data = this._get(name)
    if (data == undefined) return defaultValue

    try {
      return JSON.parse(data)
    } catch (e) {return defaultValue}
  }


  set(name, value) {this._set(name, JSON.stringify(value))}
}


export default Cookie
