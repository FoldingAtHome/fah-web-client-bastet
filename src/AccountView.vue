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
function copy_config(config = {}) {
  return {
    dark:              config.dark,
    columns:           (config.columns || []).concat([]),
    wide:              !!config.wide,
    compact:           !!config.compact,
    hide_empty_groups: !!config.hide_empty_groups,
  }
}


function copy_account(data) {
  let cause = (!data.cause || data.cause == 'unspecified') ? 'any' : data.cause

  return {
    user:    data.user,
    team:    data.team    || 0,
    passkey: data.passkey || undefined,
    cause,
    avatar:  data.avatar  || '',
    node:    data.node    || undefined,
    config:  copy_config(data.config),
  }
}


export default {
  props: ['tab'],
  inheritAttrs: false,


  data() {
    return {
      mounted:     false,
      account_new: {config: {}},
      confirmed:   false,

      confirm_dialog_buttons: [
        {name: 'cancel',  icon: 'times'},
        {name: 'discard', icon: 'trash'},
        {name: 'save',    icon: 'floppy-o'}
      ],
    }
  },


  watch: {
    '$adata'() {if (this.$adata) this.init()},
  },


  computed: {
    tabs() {
      return [
        {name: 'account',    icon: 'cog'},
        {name: 'appearance', icon: 'window-maximize'},
        {name: 'teams',      icon: 'users'},
      ]
    },


    valid() {return this.mounted && this.$adata},


    modified() {
      return !this.$util.isEqual(
        copy_account(this.account_new), copy_account(this.$adata))
    }
  },


  beforeRouteLeave(to, from) {
    if (!this.modified || this.confirmed || !this.$account.logged_in)
      return true

    this.confirm_leave(to)
    return false
  },


  async mounted() {
    if (!this.$account.logged_in) return this.close()
    this.mounted = true
    this.init()
  },


  methods: {
    init() {this.account_new = copy_account(this.$adata)},


    async confirm_leave(to) {
      let response = await this.$refs.confirm_dialog.exec()

      switch (response) {
      case 'save': return this.save()

      case 'discard':
        this.confirmed = true
        this.$root.check_appearance()
        this.$router.push(to)
      }
    },


    async save() {
      return this.$root.pacify(async () => {
        try {
          await this.$account.save(copy_account(this.account_new))
          this.close()

        } catch (e) {
          if (e.error) e = e.error
          this.$root.message('error', 'Save Failed',
                             'Failed to save account settings: ' + e)
        }
      })
    },


    cancel() {this.close()},


    async close() {
      this.confirmed = true
      this.$root.check_appearance()
      this.$router.back()
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
  ViewHeader(title="Account Settings")
    template(v-slot:actions)
      Button(@click="cancel", :text="modified ? 'Cancel' : 'Close'",
        icon="times",
        title="Leave Account Settings without making further changes")

      Button(:disabled="!modified || !valid", @click="save", text="Save",
        success, icon="save",
        title="Save your changes and go back to the main page")

  .view-body(v-if="$adata")
    .account-menu
      Button(v-for="t in tabs", :route="t.name", replace, :icon="t.icon",
        :text="t.name", :class="{'tab-active': tab == t.name}")


    router-view(:account="account_new", :config="account_new.config")
</template>

<style lang="stylus">
.account-view .view-body
  flex-direction row

  .account-menu
    display flex
    flex-direction column
    gap calc(var(--gap) / 2)

    > .button
      justify-content left
      text-transform capitalize
      color var(--panel-fg)
      background 0
      border-radius 0
      border-bottom 3px solid var(--header-bg)

      &:hover
        border-color var(--link-alt)

      &.tab-active
        border-color var(--link-color)

  fieldset.settings .setting > label
    width 10em
</style>
