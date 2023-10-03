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


export default {
  props: ['mach'],
  components: {CommonSettings},


  data() {
    return {
      initial_config:  undefined,
      config:          undefined,
      active_gpu:      undefined,
      show_key:        false,
      confirmed:       false,

      confirm_dialog_buttons: [
        {name: 'cancel',  icon: 'times'},
        {name: 'discard', icon: 'trash'},
        {name: 'save',    icon: 'floppy-o'}
      ],
    }
  },


  watch: {
    'data.config'(config) {this.init(config)}
  },


  computed: {
    have_account() {return this.$adata.created},


    keys() {
      let keys = ['on_idle', 'cpus', 'gpus', 'beta', 'key']

      if (!this.have_account)
        return keys.concat(['user', 'team', 'passkey', 'cause'])

      return keys
    },


    info() {return this.data.info       || {}},
    data() {return this.mach.get_data() || {}},


    modified() {
      if (!this.config) return false
      return !this.$util.isEqual(this.initial_config, this.config)
    },


    gpu_settings_dialog_buttons() {
      return [{name: 'ok', icon: 'check', success: true}]
    },


    gpus_enabled() {
      if (!this.config || !this.config.gpus) return 0

      let c = 0
      let gpus = this.config.gpus

      for (const name in gpus)
        if (gpus[name].enabled) c++

      return c
    },


    available_cpus() {return this.info ? this.info.cpus : 0},
    available_gpus() {return this.info ? this.info.gpus : {}},


    gpus() {
      if (!this.data.config || !this.data.config.gpus) return []

      let gpus = []
      for (const id in this.available_gpus) {
        let config = this.data.config.gpus[id]
        let info   = this.available_gpus[id]

        if (info) {
          let enabled = config && config.enabled
          let gpu = Object.assign({id, enabled}, info)
          if (gpu.supported == undefined) gpu.supported = true
          gpus.push(gpu)
        }
      }

      return gpus
    }
  },


  beforeRouteLeave(to, from) {
    if (!this.modified || this.confirmed) return true

    this.$refs.confirm_dialog.exec().this(response => {
      switch (response) {
      case 'save': return this.save()

      case 'discard':
        this.confirmed = true
        this.$router.push(to)
      }
    })

    return false
  },


  mounted() {this.init(this.data.config)},


  methods: {
    init(config) {
      if (this.config || !config || this.$util.isEmpty(config)) return

      this.config = this.$util.deepCopy(config)

      this.config.gpus = {}
      for (let id in this.available_gpus) {
        const gpu = config.gpus[id] || {}

        this.config.gpus[id] = {
          enabled: gpu.enabled || false,
          beta:    gpu.beta    || false,
          key:     gpu.key     || 0,
        }
      }

      if (this.config.cpus < 0) this.config.cpus = 0

      if (this.config.cause)
        this.config.cause = this.config.cause.toLowerCase()

      this.config.beta = !!this.config.beta
      this.config.key  = this.config.key || 0

      this.initial_config = this.$util.deepCopy(this.config)
    },


    save() {
      let config = {}

      for (const key of this.keys)
        if (key == 'gpus') {
          config.gpus = {}

          for (const [id, gpu] of Object.entries(this.config.gpus)) {
            let gconf = config.gpus[id] = {}

            for (const gkey of ['enabled', 'beta', 'key'])
              gconf[gkey] = gpu[gkey]
          }

        } else config[key] = this.config[key]

      this.mach.configure(config)
      this.close()
    },


    cancel() {this.close()},


    close() {
      this.confirmed = true
      this.$router.replace('/')
    },


    gpu_enabled(id) {return this.config.gpus[id].enabled},
    gpu_play(id)    {this.config.gpus[id].enabled = true},
    gpu_pause(id)   {this.config.gpus[id].enabled = false},


    async gpu_settings(id) {
      this.active_gpu = id
      await this.$refs.gpu_settings_dialog.exec()
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

Dialog.gpu-settings-dialog(
  ref="gpu_settings_dialog", :buttons="gpu_settings_dialog_buttons",
  :allowCancel="false")
  template(v-slot:header) GPU Settings
  template(v-slot:body)
    fieldset.settings(v-if="active_gpu")
      HelpBalloon(name="Beta Projects").
        Enable folding of beta projects.  Beta projects are in testing and may
        fail and cause you to loose points.

      input(v-model="config.gpus[active_gpu].beta", type="checkbox",
        title="Enable beta projects.")
      div

      HelpBalloon(name="Project Key").
        Project keys are used for internal testing of folding projects.
        Unless you are specically instructed by a Folding@home researcher to use
        a project key, leave this field set to zero.

      input(v-model="config.gpus[active_gpu].key", type="number",
        title="Project key.")
      div


.settings-view.page-view
  .view-header-container
    .view-header
      div
        FAHLogo

      div
        h2 Client Settings
        h3 Machine: {{mach.get_name()}}

      .actions
        Button(@click="cancel", text="Cancel", icon="times")
        Button.button-success(:disabled="!modified", @click="save",
          text="Save", icon="save")

  .view-body(v-if="config")
    fieldset.settings(v-if="!have_account")
      legend Account Settings

      CommonSettings(:config="config")

    fieldset.settings
      legend
        HelpBalloon(name="Resource Settings").
          These settings control the usage of your machines compute resources.

      HelpBalloon(name="CPUs")
        p Choose how many CPU cores Folding@home should try to utilize.
        p.
          Reduce the number of CPUs allocate to folding if your system runs too
          slow while Folding@home is running.  Set to the maximum to earn the
          most points.  However, you may also consider reserving a few CPUs if
          you are also doing GPU folding.  GPU folding may also need some CPU
          power.

      .cpus-input
        input(v-model.number="config.cpus", :min="0", type="range",
          :max="available_cpus", v-if="0 < available_cpus")
        | {{config.cpus}} of {{available_cpus}}
      div

      HelpBalloon(name="GPUs")
        p Choose which of your GPUs to run Folding@home on.
        p.
          Some GPUs are not supported by Folding@home either because they are
          too old, too new, the necessary driver software is missing from you
          computer or the GPU has know bugs that prevent folding from working
          correctly.  If your GPU is not supported you will not be able to
          enable it.

        p Either CUDA, OpenCL or both is required for folding.


      table.gpus-input
        tr
          th ID
          th Description
          th Actions

        tr.gpu-row(v-for="gpu in gpus",
          :class="{unsupported: !gpu.supported}",
          :title="!gpu.supported ? 'Unsupported GPU.' : ''")
          td.gpu-id {{gpu.id.substr(4)}}
          td.gpu-description {{gpu.description}}

          td.gpu-actions
            Button.button-icon(icon="cog", @click="gpu_settings(gpu.id)",
              title="Edit GPU settings.")

            Button.button-icon(v-if="gpu_enabled(gpu.id)", icon="pause",
              @click="gpu_pause(gpu.id)", title="Pause folding on this GPU.")

            Button.button-icon(v-else, @click="gpu_play(gpu.id)", icon="play",
              title="Start folding on this GPU.", :disabled="!gpu.supported")
      div

      HelpBalloon(name="Only When Idle").
        Enable folding only when your machine is idle.  I.e. when the mouse
        and keyboard are not being used.

      input(v-model="config.on_idle", type="checkbox",
        title="Only fold when computer is idle.")
      div

    fieldset.settings
      legend
        HelpBalloon(name="Expert Settings").
          These settings are for testing Folding@home.

      HelpBalloon(name="Beta Projects").
        Enable folding of beta projects.  Beta projects are in testing and may
        fail and cause you to loose points.

      input(v-model="config.beta", type="checkbox",
        title="Enable beta projects.")
      div

      HelpBalloon(name="Project Key").
        Project keys are used for internal testing of folding projects.
        Unless you are specically instructed by a Folding@home researcher to use
        a project key, leave this field set to zero.

      input(v-model="config.key", type="number", title="Project key.")
      div
</template>

<style lang="stylus">
@import('colors.styl')

.settings-view
  .view-header
    > div
      display flex
      flex-direction column
      gap 0.5em

      > *
        margin 0

    h3
      display flex
      gap 1em

  fieldset
    .cpus-input
      white-space nowrap

    .cpus-input, .gpus-input
      border-collapse collapse

      th, td
        border 1px solid #666
        padding 0.25em

      th
        text-align left

      .gpu-row.unsupported td
        opacity 0.4

      .gpu-description
        width 100%

      .gpu-compute
        white-space nowrap

        img
          height 24px
          margin 5px

    .gpu-actions
      text-align center
      white-space nowrap

      > a
        display inline-block
        margin 0.25em
</style>
