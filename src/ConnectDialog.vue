<!--

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

-->

<script>
export default {
  data() {return {address: ''}},


  computed: {
    buttons() {
      return [
        {name: 'Connect', icon: 'check', success: true, disabled: !this.valid}
      ]
    },


    valid() {return /^[\w-]+(\.[\w-]+)*(:\d+)?$/.test(this.address)}
  },


  methods: {
    async exec() {
      this.address = this.$direct.address
      return this.$refs.dialog.exec()
    }
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
    gap var(--gap)
</style>
