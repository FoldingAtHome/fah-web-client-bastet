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
import util from './util'


export default {
  props: ['client'],


  data() {
    return {
      config:          undefined,
      causes:          [],
      show_key:        false,
      confirmed:       false,
      new_peers:       '',
      team_app_url:    'https://apps.foldingathome.org/team',
      passkey_app_url: 'https://apps.foldingathome.org/getpasskey',

      confirm_dialog_buttons: [
        {name: 'cancel',  icon: 'times'},
        {name: 'discard', icon: 'trash'},
        {name: 'save',    icon: 'floppy-o'}
      ],
    }
  },


  watch: {
    'client.state.data.config'(config) {
      if (config && !this.config) this.init(config)
    }
  },


  computed: {
    info() {return this.client.state.data.info},
    data() {return this.client.state.data},


    modified() {
      if (!this.config) return false
      return !util.isEqual(this.data.config, this.config)
    },


    gpus_enabled() {
      if (!this.config || !this.config.gpus) return 0

      let c = 0
      let gpus = this.config.gpus

      for (const name in gpus)
        if (gpus[name].enabled) c++

      return c
    },


    max_cpus() {return this.info ? this.info.cpus : 0},


    gpus() {
      if (!this.data.config || !this.data.config.gpus) return []

      let gpus = []
      for (const id in this.info.gpus) {
        let config = this.data.config.gpus[id]
        let info   = this.info.gpus[id]

        if (info) {
          let gpu = Object.assign({id, enabled: config && config.enabled}, info)
          if (gpu.supported == undefined) gpu.supported = true

          for (let name of ['OpenCL', 'CUDA']) {
            let type    = name.toLowerCase()
            let cinfo   = gpu[type] = gpu[type] || {}
            let enabled = cinfo.compute

            cinfo.image = `/images/${enabled ? '' : 'no-'}${type}.png`

            if (enabled)
              cinfo.title = `${name} enabled with compute level ` +
                `${cinfo.compute} and driver version ${cinfo.driver}.`

            else cinfo.title = `${name} not supported.`
          }

          gpus.push(gpu)
        }
      }

      return gpus
    },


    new_peers_valid() {
      let peers = this.new_peers.match(/[^ ]+/g)

      if (!peers) return false

      for (let peer of peers)
        if (!util.parse_peer_address(peer))
          return false

      return true
    }
  },


  beforeRouteLeave(to, from) {
    if (!this.modified || this.confirmed) return true

    this.$refs.confirm_dialog.open(response => {
      switch (response) {
      case 'save': return this.save()

      case 'discard':
        this.confirmed = true
        this.$router.push(to)
      }
    })

    return false
  },


  mounted() {
    if (this.data.config) this.init(this.data.config)

    if (!this.causes.length)
      fetch(util.api_url + '/project/cause')
      .then(r => r.json())
      .then(data => {
        data[0] = 'any'
        this.causes = data
      })
  },


  methods: {
    init(config) {
      this.config = util.deepCopy(config)

      for (let name in this.info.gpus)
        if (!this.config.gpus[name])
          this.config.gpus[name] = {enabled: false}

      if (this.config.cpus < 0) this.config.cpus = 0

      if (this.config.cause)
        this.config.cause = this.config.cause.toLowerCase()
    },


    save() {
      this.client.configure(this.config)
      this.close()
    },


    cancel() {
      this.$root.check_fold_anon()
      this.close()
    },


    close() {
      this.confirmed = true
      this.$router.replace('/')
    },


    add_peers() {
      let peers = this.new_peers.match(/[^ ]+/g)
      if (peers) {
        peers = peers.filter(peer => util.parse_peer_address(peer))
        this.config.peers = [...new Set([...this.config.peers, ...peers])]
      }

      this.new_peers = ''
    },


    del_peer(peer) {
      this.config.peers = this.config.peers.filter(x => x != peer)
    }
  }
}
</script>

<template lang="pug">
Dialog(:buttons="confirm_dialog_buttons", ref="confirm_dialog")
  template(v-slot:header) Unsaved changes
  template(v-slot:body).
    You have unsaved configuration changes.  Would you like to save your
    changes, discard them or cancel and stay on this page?

.settings-view.page-view
  .view-header-container
    .view-header
      FAHLogo
      div
        h2 Settings
        h3(v-if="client.state.address") Peer {{client.state.address}}

      .actions
        Button(@click="cancel", text="Cancel", icon="times")
        Button.button-success(:disabled="!modified", @click="save",
          text="Save", icon="save")

  .view-body(v-if="config")
    fieldset.user-settings
      legend User Settings

      label Fold Anonymously
      input(v-model="config.fold_anon", type="checkbox",
        title="Fold without a username, team or passkey.")
      div

      label Username
      input(v-model="config.user", :disabled="config.fold_anon")
      div

      label Team
      input(v-model.number="config.team", type="number",
        :disabled="config.fold_anon")

      Button(text="New Team", icon="plus", :href="team_app_url",
        title="Create a new team.")

      label Passkey
      div
        input(v-model="config.passkey", pattern="[\da-fA-F]{31,32}",
          :type="show_key ? 'text' : 'password'", :disabled="config.fold_anon")

        Button.button-icon(:icon="'eye' + (show_key ? '' : '-slash')",
          @click="show_key = !show_key",
          :title="(show_key ? 'Hide' : 'Show') + ' passkey'")

      Button(text="New Passkey", icon="plus", :href="passkey_app_url",
        title="Create a passkey to earn bonus points.")

    fieldset.project-settings
      legend Project Settings

      label Enable Beta
      input(v-model="config.beta", type="checkbox",
        title="Enable beta testing.")
      div

      label Cause
      select(v-model="config.cause")
        option(v-for="name in causes", :value="name") {{name}}
      div

      label Project Key
      input(v-model.number="config.key")
      div

    fieldset.resource-usage
      legend Resource Usage

      label Fold When Idle
      input(v-model="config.on_idle", type="checkbox",
        title="Only fold when computer is idle.")
      div

      label CPUs
      .cpus-input
        span {{config.cpus}} of {{max_cpus}}
        input(v-model.number="config.cpus", type="range", :min="0",
          :max="max_cpus", v-if="0 < max_cpus")
      div

      label GPUs
      table.gpus-input
        tr
          th Description
          th Drivers
          th Enable

        tr.gpu-row(v-for="gpu in gpus", v-if="gpus",
          :class="{unsupported: !gpu.supported}",
          :title="!gpu.supported ? 'Unsupported GPU.' : ''")
          td.gpu-description {{gpu.description}}
          td.gpu-compute
            img(:src="gpu.cuda.image",   :title="gpu.cuda.title")
            img(:src="gpu.opencl.image", :title="gpu.opencl.title")

          td.gpu-enable
            input(v-model="config.gpus[gpu.id].enabled", type="checkbox",
              :disabled="!gpu.supported")
      div

    fieldset.peers(v-if="!client.state.path")
      legend Peers

      label
      input(v-model="new_peers", title="Space separated list of peers.",
        @keyup.enter="add_peers")
      button(@click="add_peers", :disabled="!new_peers_valid").
        #[.fa.fa-plus] Add peers

      label
      table
        tr(v-for="peer in config.peers.sort()", v-if="config.peers")
          td.peer {{peer}}
          td.actions
            Button.button-icon(@click="del_peer(peer)", title="Remove peer.",
              icon="trash")
      div

</template>

<style lang="stylus">
@import('colors.styl')

.settings-view
  .view-header
    .actions
      flex 1

      button
        width 8em

  fieldset
    background panel-bg
    border-radius 4px
    display grid
    gap 1em
    align-items center
    grid-template-columns 10em 1fr 10em
    max-width 60em
    margin 0 auto 1em auto
    padding 2em 1em

    > a > button
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

    .cpus-input span
      white-space nowrap

    .gpus-input
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

      .gpu-enable
        text-align center

    &.peers
      table
        border-collapse collapse

        td, th
          border 1px solid #666
          padding 0.25em

          button
            margin 0

        .peer
          width 100%
</style>
