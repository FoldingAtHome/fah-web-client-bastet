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
import Pacify           from './Pacify.vue'
import PauseDialog      from './PauseDialog.vue'
import NewAccountDialog from './NewAccountDialog.vue'
import MessageDialog    from './MessageDialog.vue'
import LoginDialog      from './LoginDialog.vue'
import ConnectDialog    from './ConnectDialog.vue'
import ChartsDialog     from './ChartsDialog.vue'
import {watchEffect}    from 'vue'


export default {
  components: {
    Pacify, PauseDialog, NewAccountDialog, MessageDialog, LoginDialog,
    ConnectDialog, ChartsDialog
  },


  data() {
    return {
      chart_mode:   'PPD',
      chart_source: 'Team',
    }
  },


  mounted() {
    this.$ctx.$root = this.$root

    window.addEventListener('keyup', this.on_key_up)
    watchEffect(() => this.check_appearance())
    this.$api.set_error_handler(this.error_handler)
    this.check_account()
  },


  computed: {
    teams() {
      let team = this.$stats.get_team()
      return team.team == undefined ? [] : [team.team]
    }
  },


  methods: {
    async on_key_up(e) {
      if (!e.ctrlKey || e.key != 'L') return

      let dialog = this.$refs.connect_dialog
      let response = await dialog.exec()
      if (response == 'connect') {
        this.$util.set_direct_address(dialog.address)
        this.$direct.set_address(dialog.address)
      }
    },


    set_wide(wide) {this.$util.set_body_class(wide, 'theme-wide')},
    check_wide() {this.set_wide((this.$adata.config || {}).wide)},


    set_dark(dark) {
      this.$util.set_body_class( dark, 'theme-dark')
      this.$util.set_body_class(!dark, 'theme-light')
    },


    check_dark() {
      let dark = (this.$adata.config || {}).dark
      if (dark == undefined) dark = this.$util.retrieve_bool('fah-dark-mode')
      this.$util.store_bool('fah-dark-mode', dark)
      this.set_dark(dark)
    },


    set_compact(compact) {this.$util.set_body_class(compact, 'theme-compact')},
    check_compact() {this.set_compact((this.$adata.config || {}).compact)},


    check_appearance() {
      this.check_dark()
      this.check_wide()
      this.check_compact()
    },


    async message(type, title, body, buttons) {
      return this.$refs.message_dialog.exec(type, title, body, buttons)
    },


    error_handler(action, error, response) {
      if (response.status == 409) {
        if (action == 'Signing in')
          return this.message(
            'error', 'Account not active',
            '<p>Please verify your email address to activate your ' +
            'account.</p><p><b>It can several minutes for the email to ' +
            'arrive.</b></p>')

        if (action == 'Registering')
          return this.message(
            'error', 'Account exists',
            'Please login or request a password reset via the login dialog.')
      }

      this.message('error', action + ' failed', error)
    },


    open_team_chart() {this.$refs.team_chart_dialog.exec()},


    async check_account() {
      let dialog = this.$refs.new_account_dialog
      return this.$account.check(dialog.exec)
    },


    async pacify(cb) {
      try {
        this.$refs.pacify.open()
        await cb()

      } finally {
        this.$refs.pacify.close()
      }
    },


    async login() {
      const {user, team, passkey} = this.$machs.get_direct_config()
      const config = {user: user || '', team: team || 0, passkey: passkey || ''}

      let result = await this.$refs.login_dialog.exec(config)

      await this.pacify(async () => {
        switch (result.response) {
        case 'login':
          await this.$account.login_with_passphrase(result.data)
          this.$router.push('/')
          break

        case 'register':
          await this.$account.register(result.data)
          return this.message(
            'info', 'Account registered', '<p>Your Folding@home account has ' +
            'been registered.</p><p>You have been sent an email verification ' +
            'message.  Please <b>follow the link in your email</b> to ' +
            'activate your account.</p><p><b>Email may take a few ' +
            'minutes to arrive.</b></p>')

        case 'reset':
          await this.$account.request_reset(result.data)
          return this.message(
            'info', 'Account reset requested', '<p>Your request to reset ' +
            'your Folding@home account has been submitted.</p><p>You have ' +
            'been sent an email verification message.  Please follow the ' +
            'link in the email to complete your account reset.</p>')

        case 'cancel': return

        default: return this.$account.login(result.response) // OAuth2
        }
      })
    },


    async logout() {
      await this.$root.pacify(async () => {
        await this.$node.logout()
        await this.$account.logout()
      })
    },


    async reset(config) {
      await this.$root.pacify(async () => {
        await this.$account.reset(config)
      })
    },


    async fold() {return this.$machs.set_state('fold')},
    async confirm_pause() {return this.$refs.pause_dialog.exec()},


    async pause() {
      let state = await this.confirm_pause()
      if (state == 'pause' || state == 'finish')
        this.$machs.set_state(state)
    }
  }
}
</script>

<template lang="pug">
router-view(v-slot="{Component}")
  keep-alive(include="WUsView")
    component(:is="Component")

Pacify(ref="pacify")
PauseDialog(ref="pause_dialog")
NewAccountDialog(ref="new_account_dialog")
MessageDialog(ref="message_dialog")
LoginDialog(ref="login_dialog")
ConnectDialog(ref="connect_dialog")
ChartsDialog(ref="team_chart_dialog", :charts="$stats.charts")
</template>

<style lang="stylus">
@import('base.styl')
</style>
