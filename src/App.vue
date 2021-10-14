<template lang="pug">
div
  Navbar
  router-view
</template>

<script>
import 'bootstrap/dist/css/bootstrap.min.css'
import Navbar from './components/Navbar.vue'
import useWebSocket from './composables/useWebSocket'
import { onBeforeUnmount } from "vue";

const ws_url = "ws://127.0.0.1:7396/api/websocket";

export default {
  name: 'App',
  components: {
    Navbar
  },
  setup() {
    const { openWebSocket, close} = useWebSocket;

    openWebSocket(ws_url);

    onBeforeUnmount(() => {
      close();
    })

  }
}
</script>
