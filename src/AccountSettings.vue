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
import CommonSettings from './CommonSettings.vue'


export default {
  props: {account: Object, config: Object},
  components: {CommonSettings},
  data() {return {show: {}}},


  computed: {
    node_valid() {
      return /^[a-z0-9\-]+(\.[a-z0-9\-]+)+$/i.test(this.account.node)
    },


    valid() {
      return this.$refs.avatar.valid && this.$refs.common.valid &&
        this.node_valid
    }
  },


  methods: {
    async reset_token() {this.$account.reset_token()},
    copy_token() {navigator.clipboard.writeText(this.$adata.token)},


    async logout() {
      await this.$root.logout()
      this.$router.back()
    },


    async confirm_delete() {
      let response = await this.$root.message(
        'confirm', 'Delete Account?',
        'Deleted accounts cannot be recovered. ' +
          'Are you sure you want to delete this account?',
        [
          {name: 'delete', icon: 'trash', text: 'Delete Account',
           class: 'button-caution'},
          {name: 'cancel', icon: 'times'}
        ])

      if (response == 'delete')
        return this.$root.pacify(async () => {
          await this.$account.delete()
          this.$router.back()
        })
    }
  }
}
</script>

<template lang="pug">
fieldset.settings.view-panel
  legend
    HelpBalloon(name="Account"): p.
      These settings affect all of the machines linked to your account.

  .setting
    HelpBalloon(name="Avatar")
      p An avatar is an optional image to represent you on Folding@home.
      p.
        The ideal avatar is 128x128 pixels.
        If you choose a larger image, it will be automatically scaled down.
        Your avatar's final size must not be less than 32 pixels in either
        dimension.

    div
      image-input(v-model="account.avatar", :width="128", :height="128",
        :min-width="32", :min-height="32", ref="avatar")

  CommonSettings(:config="account", ref="common")

  .setting
    HelpBalloon(name="Node"): p.
      A Folding@home node helps you connect to your remote clients.
      Unless otherwise instructed, it's best to leave the default value.

    input(v-model="account.node", :class="{error: !node_valid}")

  .setting
    HelpBalloon(name="Token")
      p.
        A token is used to connect your remote clients to your account.  You
        can pass your account token to a client to cause it to link to your
        account.  Once a machine is linked it will show up as one of your
        machines in your account.

      p.
        Anyone with your account token can link machines to your
        account.  Once you've used an account token it's a good idea to
        generate a new one.  Anytime you generate a new account token the
        previous account tokens are no longer valid.  But any machines which
        are already linked to your account will remain linked.

      p.
        If a client is running locally on the same machine you've logged in
        to your Folding@home account on, it will automatically be linked to
        your account.

    input(v-model="$adata.token", :class="{password: !show.token}",
      readonly)

    .setting-actions
      Button.button-icon(:icon="'eye' + (show.token ? '' : '-slash')",
        @click="show.token = !show.token",
        :title="(show.token ? 'Hide' : 'Show') + ' account token'")

      Button.button-icon(icon="refresh", @click="reset_token",
        title="Generate a new account token")

      Button.button-icon(icon="copy", @click="copy_token",
        title="Copy account token to clipboard")

  .actions
    Button(@click="logout", icon="sign-out", text="Logout")
    Button.button-caution(@click="confirm_delete", text="Delete Account",
      icon="trash", title="Permanently delete this account")
</template>

<style lang="stylus">
.account-view .view-body .actions
  width 100%
  display flex
  justify-content end
  gap var(--gap)
</style>
