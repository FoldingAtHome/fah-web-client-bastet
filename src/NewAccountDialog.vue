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
  data() {
    return {
      account: {
        user: this.$adata.user,
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
      for (const key of Object.keys(this.account)) {
        this.account[key] = this.account[key] // Trigger on value change

        if (this.$refs[key] && !this.$refs[key].validity.valid)
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
      fieldset.view-panel
        legend Required

        .setting
          label Username
          input(ref="user", v-model="account.user", minLength="2",
            maxLength="100", required)

      fieldset.view-panel
        legend Optional

        .setting
          label Team
          input(ref="team", v-model.number="account.team", type="number",
            min="0")

        .setting
          label Passkey
          input(ref="passkey", v-model="account.passkey",
            pattern="[\\da-fA-F]{31,32}")
</template>

<style lang="stylus">
.new-account
  display flex
  flex-direction column
  gap var(--gap)

  fieldset
    display grid
    gap var(--gap)
    align-items center
    grid-template-columns 6em 1fr 1.5em

    label
      text-align right
      white-space nowrap

    > div
      display flex
      gap var(--gap)
</style>
