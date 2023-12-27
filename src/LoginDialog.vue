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
      login: true,
      email: '',
      passphrase:  '',
      passphrase2:  '',
      user: '',
      team: 0,
      passkey: '',
      show: false,
      show_passkey: false
    }
  },


  computed: {
    buttons() {
      if (this.login) return []

      return [
        {name: 'cancel',   icon: 'times'},
        {name: 'register', icon: 'sign-in', disabled: !this.valid,
         success: true}
      ]
    },


    valid() {
      if (!this.login && this.passphrase != this.passphrase2)
        return false

      return /.{1,64}@.{4,255}/.test(this.email) &&
        9 < this.passphrase.length
    }
  },


  methods: {
    async exec(config = {}) {
      this.login = true
      this.passphrase = this.passphrase2 = ''
      this.show = false

      for (const [key, value] of Object.entries(config))
        this[key] = value

      let response = await this.$refs.dialog.exec()
      let data

      if (response == 'login')
        data = {
          email:      this.email,
          passphrase: this.passphrase,
        }

      if (response == 'register')
        data = {
          email:      this.email,
          passphrase: this.passphrase,
          user:       this.user || 'Anonymous',
          team:       this.team,
          passkey:    this.passkey || undefined,
        }

      return {response, data}
    },


    do_login() {if (this.valid) this.$refs.dialog.close('login')},
    google()   {this.$refs.dialog.close('google')},
    cancel()   {this.$refs.dialog.close('cancel')},


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
    template(v-if="login") Login to Folding@home
    template(v-else) Register a new Folding@home account

  template(v-slot:body)
    form.login-dialog
      template(v-if="login")
        .actions
          Button(icon="plus", text="Register New Account",
             @click="login = false",
             title="Create a new account with Folding@home")

        .text-bar Or Login

      fieldset.settings
        .setting
          label {{login ? '' : '* '}}Email
          input(v-model="email", autocomplete="username")

        .setting
          label {{login ? '' : '* '}}Passphrase
          input(v-model="passphrase", :class="{password: !show}",
            @keyup.enter="do_login", autocomplete="current-password")

          .setting-actions
            Button.button-icon(:icon="'eye' + (show ? '' : '-slash')",
              @click="show = !show",
              :title="(show ? 'Hide' : 'Show') + ' passphrase'")

        template(v-if="!login")
          .setting
            label * Confirm Passphrase
            input(v-model="passphrase2", :class="{password: !show}")
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

      template(v-if="login")
        .actions
          Button(icon="times", text="Cancel", @click="cancel",
            title="Cancel login")

          Button.button-success(icon="sign-in", text="Login", @click="do_login",
            :disabled="!valid", title="Login to your Folding@home account")

      template(v-else)
        p.required * Required

</template>

<style lang="stylus">
.login-dialog
  display flex
  flex-direction column
  gap 1em

  fieldset.settings
    border none
    margin-bottom 0
    padding 0.5em
    width 100%

    > .setting
      label
        width 10em

  .bar
    border-bottom 1px solid
    width calc(100% - 4em)
    margin 1em 2em

  .text-bar
    font-weight bold
    display flex
    flex-direction row
    padding 0 2em

    &:before, &:after
      content ""
      flex 1 1
      border-bottom 1px solid
      margin auto

    &:before
      margin-right: 1em

    &:after
      margin-left: 1em

  .actions
    display flex
    gap 1em
    margin auto
    max-width 25em

  .required
    text-align right

  p
    margin 0.25em 1em
</style>
