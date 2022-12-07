<script>

export default {
  name: 'PeerRow',
  props: ['client', 'peerID'],

  computed: {
    config() {return this.client.state.data.config},


    gpus() {
      let count = 0

      if (this.config.gpus)
        for (let id in this.config.gpus)
          if (this.config.gpus[id].enabled)
            count++

      return count
    }
  }
}
</script>

<template lang="pug">
tr.peer(:class="{connected: client.connected}")
  td(:colspan="client.connected ? 7 : 8")
    div
      span {{client.state.address}} (v{{client.version()}})
      span.status {{client.connected ? 'C' : 'Disc'}}onnected
      template(v-if="config")
        span cpus:{{config.cpus}}
        span gpus:{{gpus}}

  td.actions(v-if="client.connected")
    Button.button-icon(:route="peerID + '/settings'",
      title="Settings", icon="cog")
    Button.button-icon(:route="peerID + '/log'", title="Log",
      icon="list-alt")
    Button.button-icon(v-if="client.paused()", @click="client.fold()",
      icon="play", title="Start folding.")
    Button.button-icon(v-else, @click="$root.pause([client])",
      icon="pause", title="Pause folding.")
</template>

<style lang="stylus">
</style>
