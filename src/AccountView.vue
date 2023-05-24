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
import util        from './util'
import AccountMach from './AccountMach.vue'


function copy_account(data) {
  let cause = (!data.cause || data.cause == 'unspecified') ? 'any' : data.cause

  return {
    name:    data.name,
    team:    data.team    || 0,
    passkey: data.passkey || undefined,
    cause,
    avatar:  data.avatar  || undefined,
    node:    data.node    || undefined
  }
}


export default {
  inheritAttrs: false,
  components: {AccountMach},


  data() {
    return {
      account_new: {},
      causes:      [],
      confirmed:   false,
      show:        {},

      confirm_dialog_buttons: [
        {name: 'cancel',  icon: 'times'},
        {name: 'discard', icon: 'trash'},
        {name: 'save',    icon: 'floppy-o'}
      ],
    }
  },


  watch: {
    '$adata'() {if (this.$adata) this.init()}
  },


  computed: {
    modified() {
      return !util.isEqual(copy_account(this.account_new),
                           copy_account(this.$adata))
    }
  },


  beforeRouteLeave(to, from) {
    if (!this.modified || this.confirmed) return true
    this.confirm_leave(to)
    return false
  },


  async mounted() {
    this.init()
    this.causes = await this.$api.get_causes()
  },


  methods: {
    init() {this.account_new = copy_account(this.$adata)},


    async logout() {
      await this.$account.logout()
      this.close()
    },


    async confirm_leave(to) {
      let response = await this.$refs.confirm_dialog.exec()

      switch (response) {
      case 'save': return this.save()

      case 'discard':
        this.confirmed = true
        this.$router.push(to)
      }
    },


    async save() {
      await this.$account.save(copy_account(this.account_new))
      this.close()
    },


    cancel() {this.close()},


    close() {
      this.confirmed = true
      this.$router.replace('/')
    },


    async reset_token() {this.$account.reset_token()},
    copy_token() {navigator.clipboard.writeText(this.$adata.token)},


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

      if (response == 'delete') {
        await this.$account.delete()
        this.close()
      }
    }
  }
}
</script>

<template lang="pug">
Dialog(:buttons="confirm_dialog_buttons", ref="confirm_dialog")
  template(v-slot:header) Unsaved changes
  template(v-slot:body).
    You have unsaved account changes.  Would you like to save your
    changes, discard them or cancel and stay on this page?

.account-view.page-view
  .view-header-container
    .view-header
      FAHLogo
      div
        h2 Account Settings

      .actions
        Button(@click="cancel", text="Cancel", icon="times",
          title="Leave Account Settings with out making changes.")
        Button.button-success(:disabled="!modified", @click="save", text="Save",
          icon="save", title="Save your changes and go back to the main page.")
        Button(@click="logout", text="Logout", icon="sign-out")

  .view-body(v-if="$adata")
    fieldset.settings.account-settings
      legend
        HelpBalloon(name="Account").
          These settings affect all of the machines linked to your account.

      HelpBalloon(name="Username").
        Choose a display name for your Folding@home account.  This name
        does not have to be unique.  It may contain any characters other
        than #[tt &lt;], #[tt &gt;], #[tt &#59;], or #[tt &amp;] and must be
        between 2 and 100 characters in length.  If you wish to remain
        anonymous enter #[tt Anonymous].

      input(v-model="account_new.name")
      div

      HelpBalloon(name="Team")
        | You may wish to join a Folding@home team.  If you do not already have
        | a team you can create a new one. Enter #[tt 0] for no team.
        Button(text="Create a Team", icon="plus",
          href="https://apps.foldingathome.org/team")

      input(v-model.number="account_new.team", type="number")
      div

      HelpBalloon(name="Passkey")
        | A passkey allows you to collect bonus points.  Enter a passkey if you
        | have one.  You may leave this field blank.  Click the button to obtain
        | a passkey.
        Button(text="Get a Passkey", icon="key",
          href="https://apps.foldingathome.org/getpasskey")


      input(v-model="account_new.passkey", pattern="[\\da-fA-F]{31,32}",
        :type="show.key ? 'text' : 'password'")

      div
        Button.button-icon(:icon="'eye' + (show.key ? '' : '-slash')",
          @click="show.key = !show.key",
          :title="(show.key ? 'Hide' : 'Show') + ' passkey'")

      HelpBalloon(name="Cause").
        You may choose a prefered cause to support.  Folding@home will try to
        assign you more work supporting your prefered cause.

      select(v-model="account_new.cause")
        option(v-for="name in causes", :value="name") {{name}}
      div

      HelpBalloon(name="Node").
        A Folding@home node helps you connect to your remote clients.
        Unless otherwise instructed, it's best to leave the default value.

      input(v-model="account_new.node", pattern="[\\w-]+(\.[\\w-]+)+")
      div

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
          are already linked to you account will remain linked.

        p.
          If a client is running localy on the same machine you've logged in to
          your Folding@home account on, it will automatically be linked to your
          account.

      input(v-model="$adata.token",
        :type="show.token ? 'text' : 'password'", readonly)

      div
        Button.button-icon(:icon="'eye' + (show.token ? '' : '-slash')",
          @click="show.token = !show.token",
          :title="(show.token ? 'Hide' : 'Show') + ' account token'")

        Button.button-icon(icon="refresh", @click="reset_token",
          title="Generate a new account token.")

        Button.button-icon(icon="copy", @click="copy_token",
          title="Copy account token to clipboard.")


    fieldset.settings.machines
      legend
        HelpBalloon(name="Machines")
          p The machines linked to your account will display here.
          p You can rename your machines or unlink machines you no longer use.
          p.
            If the local machine is linked to another account it will show up
            here.  You can link it to this account by clicking on the
            #[.fa.fa-link] icon.

      AccountMach(v-for="mach in $machs", :mach="mach")

    .actions
      Button.button-caution(@click="confirm_delete", text="Delete Account",
        icon="trash", title="Permanently delete this account.")

</template>

<style lang="stylus">
@import('colors.styl')

.account-view
  .view-body > .actions
    display flex

  legend > a
    display inline

  fieldset.locked
    background #bbb
    padding 0.5em
    cursor pointer

    &:hover
      background #ddd

    > *
      font-size 120%
      font-weight bold
</style>
