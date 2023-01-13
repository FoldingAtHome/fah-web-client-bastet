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
export default {
  data() {
    return {
      pause_dialog_buttons: [
        {name: 'pause',  text: 'Pause now',             icon: 'pause'},
        {name: 'finish', text: 'Finish up, then pause', icon: 'clock-o'}
      ]
    }
  },


  methods: {
    open(cb) {this.$refs.dialog.open(cb)}
  }
}
</script>

<template lang="pug">
Dialog(:buttons="pause_dialog_buttons", ref="dialog")
  template(v-slot:header) Pause or Finish
  template(v-slot:body).
    Would you like to pause folding now or finish all the active work units
    then pause?
</template>

<style lang="stylus">
</style>
