<template lang="pug">
div(v-show="!showLoading")
  Navbar
  router-view
div(v-show="showLoading")
  .spinner-border.text-success(role="status")
    span.visually-hidden Loading...
  h3 Connecting to Folding@Home Client
</template>

<script>
import Navbar from './components/Navbar.vue'
import useWebSocket from './composables/useWebSocket'
import 'bootstrap/dist/css/bootstrap.min.css'
import { onBeforeUnmount } from "vue"

const ws_url = "ws://127.0.0.1:7396/api/websocket";

export default {
  name: 'App',
  components: {
    Navbar
  },
  setup() {
    const { showLoading, updatePeerConnections, openWebSocket, close} = useWebSocket;

    openWebSocket(ws_url);
    updatePeerConnections();

    onBeforeUnmount(() => {
      close();
    })

    return { showLoading }
  }
}
</script>
