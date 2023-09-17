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
import util             from './util.js'
import Pacify           from './Pacify.vue'
import PauseDialog      from './PauseDialog.vue'
import NewAccountDialog from './NewAccountDialog.vue'
import MessageDialog    from './MessageDialog.vue'
import LoginDialog      from './LoginDialog.vue'


export default {
  components: {
    Pacify, PauseDialog, NewAccountDialog, MessageDialog, LoginDialog},


  watch: {
    '$adata.unlocked'(unlocked) {if (unlocked) this.$node.login()},
  },


  mounted() {
    this.$api.set_error_handler(this.error_handler)
    this.check_account()
  },


  methods: {
    open_pacify()  {this.$refs.pacify.open()},
    close_pacify() {this.$refs.pacify.close()},


    async message(type, title, body, buttons) {
      return this.$refs.message_dialog.exec(type, title, body, buttons)
    },


    error_handler(action, error) {
      if (error == 'User disabled')
        return this.message(
          'error', 'Account not active',
          'Please verify your email address to activate your account.')

      this.message('error', action + ' failed', error)
    },


    async check_account() {
      let dialog = this.$refs.new_account_dialog
      return this.$account.check(dialog.exec, () => {this.$node.login()})
    },


    async login() {
      let result = await this.$refs.login_dialog.exec()

      try {
        this.open_pacify()

        switch (result.response) {
        case 'login':
          await this.$account.login_with_passphrase(result.data)
          this.$router.push('/')
          break

        case 'register':
          await this.$account.register(result.data)
          return this.message(
            'info', 'Account registered', 'Your Folding@home account has ' +
            'been registered.<br/>You have been sent an email verification ' +
            'message.  Please follow the link in the email to activate your ' +
            'account.')

        case 'cancel': return

        default: return this.$account.login(result.response) // OAuth2
        }

      } finally {
        this.close_pacify()
      }
    },


    fold() {this.$machs.fold()},


    async pause(machs) {
      this.$machs.pause(this.$refs.pause_dialog.exec, machs)
    }
  }
}
</script>

<template lang="pug">
router-view(v-slot="{Component}")
  keep-alive(include="HomeView")
    component(:is="Component")

Pacify(ref="pacify")
PauseDialog(ref="pause_dialog")
NewAccountDialog(ref="new_account_dialog")
MessageDialog(ref="message_dialog")
LoginDialog(ref="login_dialog")
</template>

<style lang="stylus">
@import('colors.styl')

*
  box-sizing border-box

.fa
  font-size 130%
  vertical-align middle

a
  text-decoration none

  &:visited, &:link
    color link-color

  &:hover
    text-decoration underline

a.fa
  &:visited, &:link
    text-decoration none
    color black

  &:hover
    text-decoration none

tt
  background rgba(0, 0, 0, 0.05)
  padding 0 0.25em

input:invalid
  outline none
  box-shadow 0 0 1px 2px #f44

body
  width 100%
  margin 0
  overflow-y scroll
  background body-bg

  #app
    display flex
    flex-direction column

.page-view
  .view-header-container
    color header-fg
    background header-bg
    min-height 8em
    padding 0 1em

    .view-header
      padding 1em
      display flex
      flex-wrap wrap
      gap 4em
      align-items flex-start
      max-width 60em
      margin auto

      a:hover
        text-decoration none

      .fah-logo
        a:visited, a:link
          color header-fg

        a:hover
          text-decoration none
          color link-color

      a.button, h1, h2
        margin 0

      .actions
        flex 1
        align-items end
        display flex
        gap 0.25em
        flex-direction column

        .fa:not(:hover)
          color header-fg

        a.button
          width 8em

  .view-body
    margin auto
    max-width 60em
    padding 1em

fieldset
  background panel-bg
  border-radius 4px
  max-width 60em
  margin 0 auto 1em auto
  padding 2em 1em

  &.settings
    background panel-bg
    border-radius 4px
    display grid
    gap 1em
    align-items center
    grid-template-columns 10em 1fr 10em

    > a.button
      margin 0
      width 100%
      text-align left

  legend
    font-size 125%
    font-weight bold

  label
    font-weight bold
    text-align right
    white-space nowrap

  > div
    display flex
    gap 1em
    align-items center

  input, select
    width 100%
    max-width 45em

  input[type=checkbox]
    width 1em

  select, option
    text-transform capitalize

.dialog-body fieldset.settings
    grid-template-columns auto 1fr auto

@import('dark.styl')
</style>
