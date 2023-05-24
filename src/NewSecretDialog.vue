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
      passphrase:  '',
      passphrase2: '',
      show: false
    }
  },


  computed: {
    buttons() {
      return [
        {name: 'cancel', icon: 'times'},
        {name: 'create', text: 'Create', icon: 'plus', disabled: !this.valid}
      ]
    },


    passphrase_short() {return this.passphrase.length < 10},


    valid() {
      return this.passphrase == this.passphrase2 && !this.passphrase_short
    }
  },


  methods: {
    async exec() {
      this.passphrase = this.passphrase2 = ''
      this.show = false
      let result = await this.$refs.dialog.exec()
      return {result, passphrase: this.passphrase}
    },


    generate_passphrase() {
      this.passphrase = this.passphrase2 = this.$crypto.gen_passphrase()
    },


    copy_passphrase() {navigator.clipboard.writeText(this.passphrase)}
  }
}
</script>

<template lang="pug">
Dialog(:buttons="buttons", ref="dialog", :allowCancel="false")
  template(v-slot:header) Create New Account Secret
  template(v-slot:body)
    .new-secret
      fieldset.settings
        label Passphrase
        input(v-model="passphrase",
          :type="show ? 'text' : 'password'")
        div
          Button.button-icon(:icon="'eye' + (show ? '' : '-slash')",
            @click="show = !show",
            :title="(show ? 'Hide' : 'Show') + ' passphrase'")

          Button.button-icon(icon="refresh", @click="generate_passphrase",
            title="Generate a random passphrase.")

          Button.button-icon(icon="copy", @click="copy_passphrase",
            title="Copy passphrase to clipboard.")

        label Again
        input(v-model="passphrase2", :type="show ? 'text' : 'password'")
</template>

<style lang="stylus">
.new-secret
  display flex
  flex-direction column
  gap 1em
</style>
