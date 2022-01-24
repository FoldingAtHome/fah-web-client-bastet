import { computed, reactive, toRefs, ref, readonly } from 'vue';

const localhost = "ws://127.0.0.1:7396/api/websocket";
const current_url = ref(localhost);

const ws_data = reactive({
  [localhost] : {
  data: { units: [], config: {}, info: {}},
  socket: null,
  isInitialized: false,
  },
})

const config = computed(() => readonly(ws_data[current_url.value].data.config));
const units = computed(() => readonly(ws_data[current_url.value].data.units));
const info = computed(() => readonly(ws_data[current_url.value].data.info));
const isInitialized = (url = localhost) => { return ws_data[url].isInitialized;}

const getBasicObject = () => {
  let obj = {
    data: { units: [], config: {}, info: {}},
    socket: null,
    isInitialized: false,
  }
  return obj;
}

const updatePeerConnections = () => {
  let peersArr = getPeers();

  // Remove connections
  for(const peer in JSON.parse(JSON.stringify(ws_data))) {
    if(!peersArr.hasOwnProperty(peer) && peer != localhost) {
      ws_data[peer].socket.close();
      delete ws_data[peer];
    }
  }

  // Add new peers
  for(let i = 0; i < peersArr.length; i++) {
    console.log(peersArr[i]);
    if(ws_data.hasOwnProperty(peersArr[i])) {
      if(!ws_data[peer].isInitialized) openWebSocket(peersArr[i]);
    }
    else {
      openWebSocket(peersArr[i]);
    }
  }
}

const connectedUrls = computed(() => {
  let conns = [];
  for(const url in JSON.parse(JSON.stringify(ws_data)))
    if(isWSOpen(url)) conns.push(url);
  return conns;
});

const getPeers = () => {
  let peers = window.localStorage.getItem("peers");
  if(!peers) return [];
  peers =  peers.split(",").map((peerUrl) => {
    peerUrl = "ws://" + peerUrl + "/api/websocket";
    return peerUrl;
  });

  return peers;
}


const isWSOpen = (url = localhost) => {
  return ws_data[url].socket != null && ws_data[url].socket != undefined && ws_data[url].socket.readyState == WebSocket.OPEN;
}

const openWebSocket = (url) => {
  console.log("Opening a websocket at url:" + url);

  if(!ws_data.hasOwnProperty(url) && url != localhost)
    ws_data[url] = getBasicObject();

  ws_data[url].socket = new WebSocket(url);
  ws_data[url].socket.addEventListener('message', onMessage);
  ws_data[url].socket.addEventListener('open', onOpen);
  ws_data[url].socket.addEventListener('close', onClose);
}

const send = (msg) => {
  let message = JSON.stringify(msg);
  ws_data[current_url.value].socket.send(message);

  console.log("Sending message to server - " + current_url.value + ":" + message);
}

const close = (url) => {
  console.log("Closing Websocket connection." + url);
  ws_data[url].socket.close();
}

const onMessage = (event) => {
  if (!ws_data[event.target.url].isInitialized) {
    console.log("Message received from websocket server: " + event.data);
    ws_data[event.target.url].data = JSON.parse(event.data);
    ws_data[event.target.url].isInitialized = true;

    for(let j = 0; j < ws_data[event.target.url].data.units.length; j++)
      if(ws_data[event.target.url].data.units[j].frames)
        ws_data[event.target.url].data.units[j].frames = [];
  }
  else {
    let updates = JSON.parse(event.data);
    console.log("Message update received." + updates);
    let temp = ws_data[event.target.url].data;

    for (let i = 0; i < updates.length - 1; i++) {
      if(updates[i] == "frames") break;
      if (i == updates.length - 2) {
        if (updates[i + 1] == null) {
          if (Array.isArray(temp)) temp.splice(updates[i], 1);
          else delete temp[updates[i]];
        }
        else {
          temp[updates[i]] = updates[i + 1];
          console.log("Updated " + JSON.stringify(temp[updates[i]]) + " -- " + JSON.stringify(updates[i + 1]));
        }
      }
      temp = temp[updates[i]];
    }
  }
}

const onOpen = (event) => {
  console.log("Successfully connected to the Server.");
  ws_data[event.target.url].isInitialized = false;
}

const onClose = (event) => {
  ws_data[event.target.url].isInitialized = false;
  setTimeout(openWebSocket(event.target.url), 2000);
}

const useWebSocket = { current_url, localhost, units, config, info, isInitialized, connectedUrls, getPeers,
  isWSOpen, openWebSocket, send, close, updatePeerConnections };

export default useWebSocket;
