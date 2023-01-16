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
      buttons: [
        {name: 'fold',   text: 'Fold Anonymously', icon: 'play'},
        {name: 'config', text: 'Change Settings',  icon: 'cog'}
      ]
    }
  },


  methods: {
    open(cb) {this.$refs.dialog.open(cb)}
  }
}
</script>

<template lang="pug">
Dialog(:buttons="buttons", ref="dialog", :allowCancel="false")
  template(v-slot:header) Fold Anonymously?
  template(v-slot:body)
    p You have not yet configured a #[b username], #[b team] or #[b passkey].
    p Would you prefer to fold anonymously or change your settings now?
</template>

<style lang="stylus">
</style>
