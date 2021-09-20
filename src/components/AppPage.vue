<template>
  <div>
    <h1>{{ msg }}</h1>
    <div class="row" v-if="data">
      <pre>{{ data["units"][0]["progress"] }} </pre>
    </div>
  </div>  
</template>

<script>

import { onBeforeUnmount } from "vue";
import useWebSocket from "../composables/useWebSocket";

const ws_url = "ws://127.0.0.1:7396/api/websocket";

export default {
  name: 'AppPage',
  props: {
    msg: String
  },
  setup() {

    const { data, openWebSocket, close} = useWebSocket();

    openWebSocket();

    onBeforeUnmount(() => {
      close();
    })

    return { data }
  }
}
</script>
