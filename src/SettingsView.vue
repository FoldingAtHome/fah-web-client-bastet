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
import GroupSettings  from './GroupSettings.vue'


function copy_keys(config, keys) {
  let copy = {}

  for (let key of keys)
    copy[key] = config[key]

  return copy
}


export default {
  props: ['mach'],
  components: {CommonSettings, GroupSettings},


  data() {
    return {
      name:            this.mach.get_name(),
      initial_config:  undefined,
      config:          undefined,
      group:           '',
      new_group:       '',
      confirmed:       false,
      unlocked:        this.$util.retrieve_bool('fah-settings-unlocked'),

      confirm_dialog_buttons: [
        {name: 'cancel',  icon: 'times'},
        {name: 'discard', icon: 'trash'},
        {name: 'save',    icon: 'floppy-o'}
      ],
    }
  },


  watch: {
    'data.config'() {this.init()}
  },


  computed: {
    logged_in() {return this.$account.logged_in},
    connected()    {return this.mach.is_connected()},
    linked()       {return this.mach.is_linked()},
    valid_name()   {return /^[\w\.-]{1,64}$/.test(this.name)},

    advanced() {
      if (this.unlocked) return true

      let config = this.config || {}

      for (let [name, group] of Object.entries(config.groups || {}))
        if (name || group.key || group.beta) return true

      return false
    },


    keys() {
      let keys = ['on_idle', 'cpus', 'gpus', 'beta', 'key']

      if (!this.logged_in)
        return keys.concat(['user', 'team', 'passkey', 'cause'])

      return keys
    },


    info()    {return this.mach.get_info()},
    data()    {return this.mach.get_data()},
    groups()  {return (this.config || {}).groups || {}},
    version() {return this.mach.get_version()},


    name_modified() {return this.name != this.mach.get_name()},


    config_modified() {
      return !this.$util.isEqual(this.initial_config, this.config)
    },


    modified() {
      if (!this.valid_name) return false
      if (!(this.$refs.common || {valid: true}).valid) return false
      if (this.name_modified) return true
      if (!this.config) return false
      return this.config_modified
    },


    available_cpus() {return this.info ? this.info.cpus : 0},
    available_gpus() {return this.info ? this.info.gpus : {}},


    gpus() {
      let gpus = []

      for (const [id, info] of Object.entries(this.available_gpus))
        gpus.push(Object.assign({id, supported: true}, info))

      return gpus
    }
  },


  beforeRouteLeave(to, from) {
    if (!this.modified || this.confirmed) return true

    this.$refs.confirm_dialog.exec().then(response => {
      switch (response) {
      case 'save': return this.save()

      case 'discard':
        this.confirmed = true
        this.$router.push(to)
      }
    })

    return false
  },


  mounted() {this.init()},


  methods: {
    async link() {
      this.mach.set_name(this.name)
      this.mach.link(this.$adata.token)
    },


    async unlink() {
      let response = await this.$root.message('confirm', 'Unlink machine?',
        '<p>If you unlink this machine you will lose remote access.</p>' +
        '<p>Are you sure you want to unlink?', ['no', 'yes'])
      if (response != 'yes') return
      await this.mach.unlink()
      await this.$account.update()
      this.$router.back()
    },


    get_group_config(config) {
      let keys = ['on_idle', 'cpus', 'gpus', 'beta', 'key', 'cuda', 'hip']
      let copy = copy_keys(config, keys)

      copy.on_idle = !!copy.on_idle
      copy.cpus    = copy.cpus || 0
      copy.beta    = !!copy.beta
      copy.key     = copy.key || 0
      copy.cuda    = copy.cuda == undefined ? true : copy.cuda
      copy.hip     = copy.hip  == undefined ? true : copy.hip

      if (this.$util.version_less('8.3.1', this.version)) {
        copy.on_battery = !!config.on_battery
        copy.keep_awake = !!config.keep_awake
      }

      let config_gpus = config.gpus || {}
      copy.gpus = {}
      for (let id in this.available_gpus) {
        const enabled = (config_gpus[id] || {}).enabled || false
        copy.gpus[id] = {enabled}
      }

      // Add GPUs which are enabled but not detected
      for (const [id, gpu] of Object.entries(config_gpus))
        if (gpu.enabled && !copy.gpus[id]) copy.gpus[id] = {enabled: true}

      return copy
    },


    get_account_config(config) {
      let copy = copy_keys(config, ['user', 'team', 'passkey', 'cause'])

      if (!copy.cause || copy.cause == 'unspecified') copy.cause = 'any'
      copy.cause = copy.cause.toLowerCase()

      return copy
    },


    init() {
      let config = this.data.config
      if (this.config || !config || this.$util.isEmpty(config)) return

      config = this.logged_in ? {} : this.get_account_config(config)

      if (!this.data.groups)
        config.groups = {'': this.get_group_config(config)}

      else {
        config.groups = {}

        for (const [name, group] of Object.entries(this.data.groups))
          config.groups[name] = this.get_group_config(group.config)
      }

      this.config = config
      this.initial_config = this.$util.deepCopy(this.config)
    },


    async save() {
      if (this.name_modified)   await this.mach.save_name(this.name)
      if (this.config_modified) await this.mach.configure(this.config)
      this.close()
    },


    cancel() {this.close()},


    close() {
      this.confirmed = true
      this.$router.back()
    },


    async add_group() {
      this.new_group = ''
      let result = await this.$refs.new_group_dialog.exec()
      if (result != 'create') return

      let name = this.new_group.trim()
      if (!(name in this.config.groups))
        this.config.groups[name] = this.get_group_config({})

      this.group = name
    },


    async del_group() {
      let result = await this.$root.message(
        'confirm', 'Delete Resource Group?', 'Are you sure you want to ' +
          ' delete resource group "' + this.group + '"?', 'Cancel Delete')

      if (result != 'delete') return

      delete this.config.groups[this.group]
      this.group = ''
    },


    async unlock() {
      let result = await this.$root.message(
        'confirm', 'Unlock Advanced Settings?', '<p>Advanced settings are ' +
          'mainly used for testing Folding@home.</p><p>Are you sure you ' +
          'want to unlock advanced settings?</p>', 'Cancel Unlock')

      if (result != 'unlock') return

      this.unlocked = true
      this.$util.store_bool('fah-settings-unlocked', true)
    }
  }
}
</script>

<template lang="pug">
Dialog(ref="confirm_dialog", :buttons="confirm_dialog_buttons")
  template(v-slot:header) Unsaved changes
  template(v-slot:body).
    You have unsaved configuration changes.  Would you like to save your
    changes, discard them or cancel and stay on this page?

Dialog.new-group-dialog(ref="new_group_dialog", buttons="Create")
  template(v-slot:header) Add New Resource Group
  template(v-slot:body)
    label Name
    input(v-model="new_group", focused,
      @keyup.enter="$refs.new_group_dialog.close('create')")

.settings-view.page-view
  ViewHeader(title="Settings", :subtitle="mach.get_name()")
    template(v-slot:actions)
      Button(@click="cancel", text="Cancel", icon="times")

      Button(:disabled="!modified", @click="save", success, text="Save",
        icon="save")

  .view-body
    fieldset.settings.view-panel(v-if="logged_in")
      legend
        HelpBalloon(name="Machine")
          p You can rename the machine or unlink a machine you no longer use.
          p.
            Machine names can be from 1 to 64 characters in length and may
            include a-z, 0-9, dashes (-) and dots (.).
          p.
            If the local machine is linked to another account you can link it to
            this account by clicking on the #[span.fa.fa-link] icon.

      .setting
        label Name
        input(v-model="name", :class="{error: !valid_name}")

        .setting-actions
          Button.button-icon(v-if="linked", @click="unlink",
            icon="unlink", title="Unlink machine from this account")

          Button.button-icon(v-if="!linked", @click="link", icon="link",
            :disabled="!valid_name", title="Link machine to this account")

    fieldset.settings.view-panel(v-if="!logged_in && config")
      legend Account Settings
      CommonSettings(:config="config", ref="common")

    .view-pane(v-if="connected && config")
      fieldset.view-panel.resource-groups(v-if="advanced")
        legend Resource Groups

        Button(v-for="(g, name) in groups", :text="name || 'Default'",
          :class="{active: group == name}", :disabled="name == group",
          @click="group = name")

        .actions
          Button(@click="del_group", icon="trash", text="Delete",
            :title="'Delete resource group ' + group", :disabled="!group")

          Button(@click="add_group", icon="plus", text="Add",
            title="Add a new resource group")

      component.group-settings(:is="advanced ? 'fieldset' : 'div'",
        :class="{'view-panel': advanced}")
        legend(v-if="advanced")
          | {{group ? '' : 'Default'}} Resource Group {{group}}

        GroupSettings(:config="groups[group]", :cpus="available_cpus",
          :gpus="gpus", :advanced="advanced", :version="version")

  .actions
    Button.button-icon(v-if="!advanced && connected", @click="unlock",
      icon="lock", title="Unlock advanced settings")
</template>

<style lang="stylus">
.settings-view
  .view-body .view-pane
    display flex
    flex-direction row
    gap var(--gap)

    .resource-groups
      flex-direction column
      gap var(--gap)
      align-items stretch
      display flex
      width auto

      > .button
        justify-content left

      .actions
        flex 1
        flex-direction row
        align-items end

    .group-settings
      display flex
      flex-direction column
      gap var(--gap)
      flex 1

  .actions
    display flex
    justify-content end
    gap var(--gap)

  > .actions
    opacity 0.4

.new-group-dialog .dialog-body
  display flex
  gap var(--gap)

  input
    flex 1

@media (max-width 800px)
  .settings-view .view-body .view-pane .resource-groups > .actions
    flex-direction column
    align-items normal

    .button
      justify-content left
</style>
