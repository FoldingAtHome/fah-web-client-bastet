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
      mode:         'login',
      email:        '',
      passphrase:   '',
      passphrase2:  '',
      user:         '',
      team:         0,
      passkey:      '',
      show:         false,
      show_passkey: false,
    }
  },


  computed: {
    buttons() {
      switch (this.mode) {
      case 'login': return []
      case 'register': return [
        {name: 'cancel',   icon: 'times'},
        {name: 'register', icon: 'sign-in', disabled: !this.valid,
         success: true}
      ]
      case 'reset': return [
        {name: 'cancel', icon: 'times'},
        {text: 'Request Reset', name: 'reset', icon: 'check',
         disabled: !this.valid, success: true}
      ]
      }
    },


    valid() {
      switch (this.mode) {
      case 'register': if (this.passphrase != this.passphrase2) return false
      case 'login': if (this.passphrase.length < 10) return false
      }

      return /.{1,64}@.{4,255}/.test(this.email)
    }
  },


  methods: {
    async exec(config = {}) {
      this.mode = 'login'
      this.passphrase = this.passphrase2 = ''
      this.show = false

      for (const [key, value] of Object.entries(config))
        this[key] = value

      let response = await this.$refs.dialog.exec()
      let data

      switch (response) {
      case 'login':
        data = {
          email:      this.email,
          passphrase: this.passphrase,
        }
        break

      case 'register':
        data = {
          email:      this.email,
          passphrase: this.passphrase,
          user:       this.user || 'Anonymous',
          team:       this.team,
          passkey:    this.passkey || undefined,
        }
        break

      case 'reset':
        data = {email: this.email}
        break
      }

      return {response, data}
    },


    close(action) {
      this.show = false
      this.$refs.dialog.close(action)
    },


    do_login() {if (this.mode == 'login' && this.valid) this.close('login')},
    cancel()   {this.close('cancel')},


    generate_passphrase() {
      this.passphrase = this.passphrase2 = this.$crypto.gen_passphrase()
    },


    copy_passphrase() {navigator.clipboard.writeText(this.passphrase)}
  }
}
</script>

<template lang="pug">
Dialog(:buttons="buttons", ref="dialog", width="40em")
  template(v-slot:header)
    template(v-if="mode == 'login'") Login to Folding@home
    template(v-else-if="mode == 'register'") Register a new Folding@home account
    template(v-else-if="mode == 'reset'") Request Folding@home account reset

  template(v-slot:body)
    form.login-dialog
      template(v-if="mode == 'login'")
        .actions
          Button(icon="plus", text="Register New Account",
             @click="mode = 'register'",
             title="Create a new account with Folding@home")

        .text-bar Or Login

      fieldset.settings
        .setting
          label {{mode != 'register' ? '' : '* '}}Email
          input(v-model="email", name="email", autocomplete="username")

        .setting(v-if="mode != 'reset'")
          label {{mode != 'register' ? '' : '* '}}Passphrase
          input(v-model="passphrase", :type="show ? 'text' : 'password'",
            @keyup.enter="do_login", name="password",
            autocomplete="current-password")

          .setting-actions
            Button.button-icon(:icon="'eye' + (show ? '' : '-slash')",
              @click="show = !show",
              :title="(show ? 'Hide' : 'Show') + ' passphrase'")

        template(v-if="mode == 'register'")
          .setting
            label * Confirm Passphrase
            input(v-model="passphrase2", :type="show ? 'text' : 'password'",
              autocomplete="new-password")
            .setting-actions
              Button.button-icon(icon="refresh", @click="generate_passphrase",
                title="Generate a memorable and strong random passphrase")

              Button.button-icon(icon="copy", @click="copy_passphrase",
                title="Copy passphrase to clipboard")

          .setting
            label Username
            input(v-model="user")

          .setting
            label Team
            input(v-model="team", type="number")

          .setting
            label Passkey
            input(v-model="passkey", :class="{password: !show_passkey}")
            .setting-actions
              Button.button-icon(:icon="'eye' + (show_passkey ? '' : '-slash')",
                @click="show_passkey = !show_passkey",
                :title="(show ? 'Hide' : 'Show') + ' passkey'")

      template(v-if="mode == 'login'")
        .actions
          Button(icon="times", text="Cancel", @click="cancel",
            title="Cancel login")

          Button(icon="sign-in", text="Login", @click="do_login", success,
            :disabled="!valid", title="Login to your Folding@home account")

        p: a(href="#", @click="mode = 'reset'") Forgot your passphrase?

      template(v-if="mode == 'register'")
        p.required * Required

</template>

<style lang="stylus">
.login-dialog
  display flex
  flex-direction column
  text-align center
  gap var(--gap)

  fieldset.settings
    border none
    padding var(--gap)
    width 100%

    > .setting
      label
        width 10em

  .bar
    border-bottom 1px solid
    width calc(100% - 4 * var(--gap))
    margin var(--gap) calc(2 * var(--gap))

  .text-bar
    font-weight bold
    display flex
    flex-direction row
    padding 0 var(--gap)

    &:before, &:after
      content ""
      flex 1 1
      border-bottom 1px solid
      margin auto

    &:before
      margin-right var(--gap)

    &:after
      margin-left var(--gap)

  .actions
    display flex
    gap var(--gap)
    margin auto
    max-width 25em

  .required
    text-align right
</style>
