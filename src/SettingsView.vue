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
import CommonSettings from './CommonSettings.vue'
import GroupSettings  from './GroupSettings.vue'


function copy_keys(config, keys) {
  let copy = {}

  for (let key of keys)
    copy[key] = config[key]

  return copy
}


function get_group_config(config, gpus) {
  let copy = copy_keys(config, ['on_idle', 'cpus', 'gpus', 'beta', 'key'])

  copy.on_idle = !!copy.on_idle
  copy.cpus    = copy.cpus || 0
  copy.beta    = !!copy.beta
  copy.key     = copy.key || 0

  copy.gpus = {}
  for (let id in gpus) {
    let gpu = (config.gpus || {})[id] || {}
    copy.gpus[id] = {enabled: gpu.enabled || false}
  }

  return copy
}


function get_account_config(config) {
  let copy = copy_keys(config, ['user', 'team', 'passkey', 'cause'])

  if (!copy.cause || copy.cause == 'unspecified') copy.cause = 'any'
  copy.cause = copy.cause.toLowerCase()

  return copy
}


export default {
  props: ['mach'],
  components: {CommonSettings, GroupSettings},


  data() {
    return {
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
    have_account() {return this.$adata.created},


    advanced() {
      if (this.unlocked) return true

      let config = this.config || {}

      for (let [group, name] of Object.entries(config.groups || {}))
        if (name || group.key || group.beta) return true

      return false
    },


    keys() {
      let keys = ['on_idle', 'cpus', 'gpus', 'beta', 'key']

      if (!this.have_account)
        return keys.concat(['user', 'team', 'passkey', 'cause'])

      return keys
    },


    info()   {return this.mach.get_info()},
    data()   {return this.mach.get_data()},
    groups() {return (this.config || {}).groups || {}},


    modified() {
      if (!this.config) return false
      return !this.$util.isEqual(this.initial_config, this.config)
    },


    available_cpus() {return this.info ? this.info.cpus : 0},
    available_gpus() {return this.info ? this.info.gpus : {}},


    gpus() {
      let gpus = []

      if (this.data.config && this.data.config.gpus)
        for (const id in this.available_gpus) {
          let config = this.data.config.gpus[id]
          let info   = this.available_gpus[id]

          if (info) {
            let gpu = Object.assign({id}, info)
            if (gpu.supported == undefined) gpu.supported = true
            gpus.push(gpu)
          }
        }

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
    init() {
      let config = this.data.config
      if (this.config || !config || this.$util.isEmpty(config)) return

      config = this.have_account ? {} : get_account_config(config)

      let gpus = this.available_gpus

      if (!this.data.groups)
        config.groups = {'': get_group_config(config, gpus)}

      else {
        config.groups = {}

        for (const [name, group] of Object.entries(this.data.groups))
          config.groups[name] = get_group_config(group.config, gpus)
      }

      console.log('CONFIG', config)

      this.config = config
      this.initial_config = this.$util.deepCopy(this.config)
    },


    async save() {
      await this.mach.configure(this.config)
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

      let gpus = this.available_gpus
      let config = get_group_config({}, gpus)
      this.config.groups[this.new_group] = config
      this.group = this.new_group
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

      Button.button-success(:disabled="!modified", @click="save",
        text="Save", icon="save")

  .view-body(v-if="config")
    fieldset.settings.view-panel(v-if="!have_account")
      legend Account Settings

      CommonSettings(:config="config")

    fieldset.view-panel.resource-groups(v-if="advanced")
      legend Resource Group
      select(v-model="group")
        option(v-for="(group, name) in groups", :value="name")
          | {{name || 'Default'}}

      .actions
        Button.button-icon(@click="del_group", icon="trash",
          title="Delete this resource group", v-if="group")

        Button.button-icon(@click="add_group", icon="plus",
          title="Add a new resource group")

    GroupSettings(:name="group", :config="groups[group]",
      :cpus="available_cpus", :gpus="gpus", :advanced="advanced")

  .actions
    Button.button-icon(v-if="!advanced", @click="unlock", icon="lock",
      title="Unlock advanced settings")
</template>

<style lang="stylus">
.settings-view
  .actions
    display flex
    justify-content end
    gap 0.5em

    .button
      margin 0

  > .actions
    opacity 0.4

  fieldset
   .cpus-input
      display flex
      gap 0.5em

      > :first-child
        flex 1

      > span
        white-space nowrap

    .gpus-input
      .gpu-row
        &.unsupported td
          opacity 0.4

        .gpu-enabled
          text-align center

      .gpu-description
        width 100%
        white-space normal

    .setting > :first-child
      width 9em

  .resource-groups
    display flex
    flex-direction row
    justify-content space-between

.new-group-dialog .dialog-body
  display flex
  gap 0.5em

  input
    flex 1
</style>
