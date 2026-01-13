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
      mode:         'login',
      email:        '',
      passphrase:   '',
      passphrase2:  '',
      user:         '',
      team:         0,
      passkey:      '',
      show:         false,
      show_passkey: false,
      show_errors:  false,
    }
  },


  computed: {
    buttons() {
      switch (this.mode) {
      case 'login': return [
        {name: 'cancel', icon: 'times'},
        {name: 'login',  icon: 'sign-in', success: true}
      ]
      case 'register': return [
        {name: 'cancel',   icon: 'times'},
        {name: 'register', icon: 'sign-in', success: true}
      ]
      case 'reset': return [
        {name: 'cancel', icon: 'times'},
        {text: 'Request Reset', name: 'reset', icon: 'check', success: true}
      ]
      }
    },


    errors() {
      let errors = []

      if (this.mode == 'register') {
        if (this.passphrase != this.passphrase2)
          errors.push('Passphrases do not match')

        if (this.team && !/^\d+$/.test(this.team))
          errors.push('Invalid team number')

        if (this.user && (this.user.length < 2 || 100 < this.user.length))
          errors.push('User name must be empty or between 2 and 100 characters')

        if (this.user && !/^[^\t]*$/.test(this.user))
          errors.push('User name cannot contain a tab')

        if (this.passkey && !/[a-fA-F\d]{30,32}/.test(this.passkey))
          errors.push('Invalid passkey')
      }

      if (this.mode != 'reset' && this.passphrase.length < 10)
        errors.push('Your passphrase must be at least 10 characters long')

      if (!this.email) errors.push('A valid email address is required')
      else if (!/.{1,64}@.{4,255}/.test(this.email))
        errors.push('Invalid email address')

      return errors
    },


    valid() {return !this.errors.length}
  },


  methods: {
    async exec(config = {}) {
      this.mode = 'login'
      this.passphrase = this.passphrase2 = ''
      this.show = false

      for (const [key, value] of Object.entries(config))
        this[key] = value

      let response

      while (true) {
        response = await this.$refs.dialog.exec()
        if (response == 'cancel' || this.valid) break
        this.show_errors = true
      }

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
          team:       parseInt(this.team),
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
          HelpBalloon(:name="`${mode != 'register' ? '' : '* '}Email`")
            p Enter your email address here.
            p.
              A validation email will be sent to this address.  You must
              click the link in this email to activate your Folding@home
              account.

          input(v-model="email", name="email", autocomplete="username")

        .setting(v-if="mode != 'reset'")
          HelpBalloon(:name="`${mode != 'register' ? '' : '* '}Passphrase`")
            p.
              Your passphrase or password is a secret phrase that grants
              access to your account.  Never share your passphrase with anyone.
              No one at Folding@home will ever ask for your passphrase.  Only
              ever enter your passphrase on foldingathome.org websites.

            p.
              When registering your Folding@home account you can generate
              a secure passphrase by clicking the #[span.fa.fa-refresh] icon.
              Make sure you save this passphrase somewhere safe, preferably in
              a password manager.

            p: strong A passphrase is not the same as a passkey.

          input(v-model="passphrase", :type="show ? 'text' : 'password'",
            @keyup.enter="close('login')", name="password",
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
            HelpBalloon(name="Username")
              p.
                You may optionally choose a user name to identify yourself on
                Folding@home.  User names may contain any characters other than
                tab and can be anywhere from 2 to 100 characters long.

              p Leave this field blank to fold anonymously.

            input(v-model="user")

          .setting
            HelpBalloon(name="Team")
              p You may optionally enter a team number here.
              p Folding@home teams work together to earn folding points.
              p You can join an existing team or start your own.
              p Enter #[tt 0] for no team.

            input(v-model="team")

          .setting
            HelpBalloon(name="Passkey")
              p.
                A passkey is different from your passphrase.  It is a unique
                identifier that differentiates points you earn from points
                earned by others who could be using the same Folding@home user
                name.

              p.
                A passkey must be 31 or 32 characters long and consist of only
                hexadecimal characters.

              p A passkey is optional.

            input(v-model="passkey", :class="{password: !show_passkey}",
              pattern="[\\da-fA-F]{31,32}")
            .setting-actions
              Button.button-icon(:icon="'eye' + (show_passkey ? '' : '-slash')",
                @click="show_passkey = !show_passkey",
                :title="(show ? 'Hide' : 'Show') + ' passkey'")

      ul.messages
        template(v-if="mode == 'login'")
          li: a(href="#", @click="mode = 'reset'") Forgot your passphrase?

        template(v-if="mode == 'register'")
          li Starred fields are required, others are optional

        template(v-if="mode == 'register' || mode == 'login'")
          li Do not use your passkey as your passphrase

        template(v-if="show_errors")
          li.error(v-for="msg in errors") {{msg}}

</template>

<style lang="stylus">
.login-dialog
  display flex
  flex-direction column
  text-align center
  gap var(--gap)

  .messages
    margin-left 10em
    text-align left

    .error
      color var(--error-color)

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
