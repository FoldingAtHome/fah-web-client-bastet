<template lang="pug">
.view
  h2 Peers
  form
    .col-md-9.col-lg-8.form-data
      textarea#peers.form-control(rows="3" cols="25" v-model="cachedPeers"
        placeholder=`Enter comma separated IP addresses with/without port numbers. Eg.
                    192.168.0.2:3000,192.168.0.3`)
    .col-md-2.col-lg-2.form-data
      button.settings.btn.btn-warning(type="button" @click="reset") Discard
      button.settings.btn.btn-primary(type="button" @click="save") Save
  table.table(v-if="connectedUrls.length != 0")
    thead
      tr
        th(width="5%")
          | Status
        th(width="95%")
          | Url
    tbody
      template(v-for="(peer, index) in connectedUrls" :key="index")
        tr
          td(:class="[ isWSOpen(peer) ? 'bgColor-green' : 'bgColor-red']")
          td {{ peer == localhost ? "Localhost" : getIP(peer) }}
</template>

<script>
import { ref } from 'vue';
import useWebSocket from '../composables/useWebSocket';

export default {
  name: "Peers",
  setup() {
    const { getIP, connectedUrls, localhost, isWSOpen, updatePeerConnections } = useWebSocket
    const cachedPeers = ref(window.localStorage.getItem("peers"));

    const reset = () => {
      cachedPeers.value = window.localStorage.getItem("peers");
    };

    const save = () => {
      console.log("Save Peers.");
      if(cachedPeers.value != window.localStorage.getItem("peers")) {
        window.localStorage.setItem("peers", cachedPeers.value);
        updatePeerConnections();
      }
    };

    return { localhost, connectedUrls, isWSOpen, cachedPeers, reset, save, getIP };
  }
}

</script>

<style lang="stylus" scoped>
form
  text-align: center

.form-data
  display: inline-block

.bgColor-green
  background-color: green

.bgColor-red
  background-color: red

button.settings
  margin: 10px
</style>
