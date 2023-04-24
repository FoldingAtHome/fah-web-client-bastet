<!--

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

-->

<script>

import util from './util.js'

export default {
  data() {
    return {
      location: ''
    }
  },


  created() {
    document.getElementsByTagName('body')[0].onkeyup = ev => {
      if (ev.keyCode == 76 && ev.ctrlKey && ev.shiftKey)
        this.open()
    }
  },


  methods: {
    accept() {this.$refs.dialog.close('Ok')},


    open(cb) {
      const host = util.default_host()
      const port = util.default_port()
      this.location = host + ':' + port

      this.$refs.dialog.open(result => {
        if (result == 'Ok') {
          let parts = this.location.split(':')

          if (parts[0]) localStorage.setItem('client-host', parts[0])
          else localStorage.removeItem('client-host')
          if (parts[1]) localStorage.setItem('client-port', parts[1])
          else localStorage.removeItem('client-port')

          location.reload()
        }
      })
    }
  }
}
</script>

<template lang="pug">
Dialog(ref="dialog", :zIndex="2000")
  template(v-slot:header) Set Client Location
  template(v-slot:body)
    .location-dialog-body
      label Location
      input(v-model="location", @keyup.enter="accept")
</template>

<style lang="stylus">
  .location-dialog-body
    display flex
    gap 0.25em
</style>
