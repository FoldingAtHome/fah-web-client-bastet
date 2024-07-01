<!--

                  This file is part of the Folding@home Client.

          The fah-client runs Folding@home protein folding simulations.
                    Copyright (c) 2001-2024, foldingathome.org
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
export default {
  data() {
    return {
      address: this.$direct.address,
      buttons: [
        {name: 'connect', icon: 'check', success: true}
      ]
    }
  },


  methods: {
    exec() {return this.$refs.dialog.exec()}
  }
}
</script>

<template lang="pug">
Dialog.connect-dialog(:buttons="buttons", ref="dialog")
  template(v-slot:header) Connect directly to a client
  template(v-slot:body)
    label Address
    input(v-model="address")
</template>

<style lang="stylus">
.connect-dialog
  .dialog-body
    display flex
    gap 0.5em
</style>
