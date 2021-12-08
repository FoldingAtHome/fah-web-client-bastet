<template lang="pug">
div(v-if="isWSOpen && isInitialized")
  Navbar
  router-view
div(v-else)
  .spinner-border.text-success(role="status")
    span.visually-hidden Loading...
  h3 Connecting to Folding@Home Client
</template>

<script>
import Navbar from './components/Navbar.vue'
import useWebSocket from './composables/useWebSocket'
import 'bootstrap/dist/css/bootstrap.min.css'
import { onBeforeUnmount } from "vue";

const ws_url = "ws://127.0.0.1:7396/api/websocket";

export default {
  name: 'App',
  components: {
    Navbar
  },
  setup() {
    const { isWSOpen, isInitialized, openWebSocket, close} = useWebSocket;

    openWebSocket(ws_url);

    onBeforeUnmount(() => {
      close();
    })

    return { isWSOpen, isInitialized }
  }
}
</script>
