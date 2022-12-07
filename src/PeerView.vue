<script>
export default {
  props: ['peerID', 'peers', 'clients'],


  computed: {
    peer() {
      let id = parseInt(this.peerID)
      if (this.peers && id < this.peers.length) return this.peers[id]
    },


    client() {return this.clients[this.peer]}
  }
}
</script>

<template lang="pug">
.peer-view
  router-view(v-if="client", :client="client")
</template>

<style lang="stylus">
</style>
