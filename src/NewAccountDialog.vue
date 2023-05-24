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
      account: {
        name: this.$adata.name,
        team: 0,
        passkey: ''
      }
    }
  },


  computed: {
    buttons() {
      return [
        {name: 'logout', text: 'Logout', icon: 'sign-out'},
        {name: 'create', text: 'Create', icon: 'plus', disabled: !this.valid}
      ]
    },


    valid() {
      for (const name of Object.keys(this.account)) {
        this.account[name] = this.account[name] // Trigger on value change

        if (this.$refs[name] && !this.$refs[name].validity.valid)
          return false
      }

      return true
    }
  },


  methods: {
    async exec() {
      let result = await this.$refs.dialog.exec()
      if (result == 'create') return this.account
    }
  }
}
</script>

<template lang="pug">
Dialog(:buttons="buttons", ref="dialog", :allowCancel="false")
  template(v-slot:header) Create New Folding@home Account
  template(v-slot:body)
    .new-account
      fieldset
        legend Required

        label Username
        input(ref="name", v-model="account.name", minLength="2",
          maxLength="100", required)
        div

      fieldset
        legend Optional

        label Team
        input(ref="team", v-model.number="account.team", type="number", min="0")
        div

        label Passkey
        input(ref="passkey", v-model="account.passkey",
          pattern="[0-9a-fA-F]{31,32}")
        div
</template>

<style lang="stylus">
.new-account
  display flex
  flex-direction column
  gap 1em

  fieldset
    background panel-bg
    border-radius 3px
    display grid
    gap 1em
    align-items center
    grid-template-columns 6em 1fr 1.5em

    label
      font-weight bold
      text-align right
      white-space nowrap

    a.button
      margin 0

    > div
      display flex
      gap 0.5em
</style>
