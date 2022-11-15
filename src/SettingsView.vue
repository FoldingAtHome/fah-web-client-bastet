<script>
import util from './util'


export default {
  props: ['peers'],

  data() {
    return {
      config: {},
      causes: [],
      show_key: false,
      confirmed: false,
      new_peers: '',
      api_url:         'https://api.foldingathome.org',
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
    'data.config'() {
      if (this.config.config == undefined && this.data.config != undefined)
        this.config = util.deepCopy(this.data.config)

      if (this.config.cause) this.config.cause = this.config.cause.toLowerCase()
    }
  },


  computed: {
    peer() {return this.peers[0]},
    data() {return this.peers[0].state.data},


    modified() {
      if (this.config == undefined) return false
      return !util.isEqual(this.data.config, this.config)
    },


    gpus_enabled() {
      if (this.config == undefined ||
          this.config.gpus == undefined) return 0

      let c = 0
      let gpus = this.config.gpus

      for (const name in gpus)
        if (gpus[name].enabled) c++

      return c
    },


    max_cpus() {
      if (this.data.info == undefined) return 0
      return this.data.info.cpus
    },


    min_cpus() {
      let min = this.gpus_enabled
      return min < 1 ? 1 : min
    },



    gpus() {
      if (this.data.config == undefined ||
          this.data.config.gpus == undefined) return []

      let gpus = []
      for (const name in this.data.config.gpus) {
        let config = this.data.config.gpus[name]
        let info = this.data.info.gpus[name]

        gpus.push({
          name,
          enabled: config.enabled,
          type: info.type,
          description: info.description
        })
      }

      return gpus
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
    this.config = this.data.config ? util.deepCopy(this.data.config) : {}

    if (!this.causes.length)
      fetch(this.api_url + '/project/cause')
      .then(r => r.json())
      .then(data => {
        data[0] = 'any'
        this.causes = data
      })
  },


  methods: {
    save() {
      this.peer.configure(this.config)
      this.cancel()
    },


    cancel() {
      this.confirmed = true
      this.$router.replace('/')
    },


    add_peers() {
      let peers = this.new_peers.match(/[^ ]+/g)
      if (peers)
        this.config.peers = [...new Set([...this.config.peers, ...peers])]
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
      h2 Client Settings

      .actions
        Button(@click="cancel", text="Cancel", icon="times")
        Button.button-success(:disabled="!modified", @click="save",
          text="Save", icon="save")

  .view-body
    fieldset.user-settings
      legend User Settings

      label Username
      input(v-model="config.user")
      div

      label Team
      input(v-model.number="config.team", type="number")

      Button(text="New Team", icon="plus", :href="team_app_url",
        title="Create a new team.")

      label Passkey
      div
        input(v-model="config.passkey", pattern="[\da-fA-F]{31,32}",
          :type="show_key ? 'text' : 'password'")

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
        span {{config.cpus}}
        input(v-model.number="config.cpus", type="range", :min="min_cpus",
          :max="max_cpus")
      div

      label GPUs
      table.gpus-input
        tr
          th Description
          th Enable

        tr(v-for="gpu in gpus", v-if="config.gpus")
          td.gpu-description {{gpu.description}}
          td: input(v-model="config.gpus[gpu.name].enabled", type="checkbox")
      div

    fieldset.peers
      legend Peers

      label
      input(v-model="new_peers", title="Space separated list of peers.")
      button(@click="add_peers", :disabled="!new_peers.trim()").
        #[.fa.fa-plus] Add peers

      label
      table
        tr(v-for="peer in config.peers", v-if="config.peers")
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

    .gpus-input
      th
        text-align left

      .gpu-description
        width 100%

    &.peers
      table
        border-collapse collapse

        td, th
          border 1px solid #666
          padding 0.5em

        .peer
          width 100%
</style>