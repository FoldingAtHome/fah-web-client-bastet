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
  props: ['token', 'email'],

  data() {
    return {
      passphrase:  '',
      passphrase2: '',
      show:        false,
      success:     false,
    }
  },


  computed: {
    valid() {
      return this.passphrase == this.passphrase2 && 9 < this.passphrase.length
    }
  },


  methods: {
    async reset() {
      await this.$root.reset(
        {token: this.token, email: this.email, passphrase: this.passphrase})
      this.success = true
    },


    generate_passphrase() {
      this.passphrase = this.passphrase2 = this.$crypto.gen_passphrase()
    },


    copy_passphrase() {navigator.clipboard.writeText(this.passphrase)}
  }
}
</script>

<template lang="pug">
.reset-view.page-view
  ViewHeader(title="Reset your Folding@home account")
    template(v-slot:actions)
      Button(icon="sign-in", text="Login", success,
        @click="$root.login()", title="Login to your Folding@home account",
        :disabled="!success")

  .view-body
    p(v-if="success").
      Account reset successful.  You may now login.

    template(v-else)
      p.
        Resetting your Folding@home account passphrase will have the following
        effects:

      ul
        li Any remote clients will need to be reconnected to your account.
        li Any other logins to this account will need to relogin.
        li Your Folding@home account settings and points will stay the same.

    form(v-if="!success")
      fieldset.settings
        .setting
          label Passphrase
          input(v-model="passphrase", :type="show ? 'text' : 'password'",
            name="password", autocomplete="current-password")

          .setting-actions
            Button.button-icon(:icon="'eye' + (show ? '' : '-slash')",
              @click="show = !show",
              :title="(show ? 'Hide' : 'Show') + ' passphrase'")

        .setting
          label Confirm Passphrase
          input(v-model="passphrase2", :type="show ? 'text' : 'password'",
            autocomplete="new-password")

          .setting-actions
            Button.button-icon(icon="refresh", @click="generate_passphrase",
              title="Generate a memorable and strong random passphrase")

            Button.button-icon(icon="copy", @click="copy_passphrase",
              title="Copy passphrase to clipboard")

        .actions
          Button(icon="check", text="Reset", @click="reset", success,
            :disabled="!valid", title="Reset your Folding@home account")
</template>

<style lang="stylus">
.reset-view
  .view-body
    display flex
    flex-direction column
    max-width 40em
    margin auto

  fieldset.settings
    border none

    > .setting
      label
        width 10em

      input
        max-width 25em !important

    .actions
      width 100%
      display flex
      flex-direction column
      align-items end
</style>
