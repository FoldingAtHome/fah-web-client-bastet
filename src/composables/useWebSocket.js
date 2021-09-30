import { computed, reactive } from 'vue';

const ws_data = reactive({
  url: "",
  data: { units: [], config: {}, info: {}},
  socket: null,
  isInitialized: false,
})

const config = computed(() => ws_data.data.config);
const units = computed(() => ws_data.data.units);
const info = computed(() => ws_data.data.info);

const openWebSocket = (url) => {
  ws_data.url = url;
  console.log("Opening a websocket at url:" + ws_data.url);
  ws_data.socket = new WebSocket(ws_data.url);
  ws_data.socket.addEventListener('message', onMessage);
  ws_data.socket.addEventListener('open', onOpen);
}

const send = (msg) => {
  var message = JSON.stringify(msg);
  console.log("Sending message to server" + message);
  ws_data.socket.send(message);
}

const close = () => {
  console.log("Closing Websocket connection.");
  ws_data.socket.close();
}

const onMessage = (event) => {
  if (!ws_data.isInitialized) {
    console.log("Message received from websocket server: " + event.data);
    ws_data.data = JSON.parse(event.data);
    ws_data.isInitialized = true;
  }
  else {
    let updates = JSON.parse(event.data);
    console.log("Message update received." + updates);
    var temp = ws_data.data;

    for (var i = 0; i < updates.length - 1; i++) {
      if (i == updates.length - 2) {
        if (updates[i + 1] == null) delete temp[updates[i]];
        else {
          temp[updates[i]] = updates[i + 1];
          console.log("Updated " + JSON.stringify(temp[updates[i]]) + " -- " + JSON.stringify(updates[i + 1]));
        }
      }
      temp = temp[updates[i]];
    }
  }
}

const onOpen = () => {
  console.log("Successfully connected to the Server.");
  ws_data.isInitialized = false;
}

const useWebSocket = { config, info, units, openWebSocket, send, close };

export default useWebSocket;
