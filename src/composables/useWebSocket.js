import { computed, reactive, ref, readonly, watch } from 'vue'

const localhost = "ws://127.0.0.1:7396/api/websocket";
const current_url = ref(localhost);
const showLoading = ref(false);

const ws_data = reactive({
  [localhost] : {
    data: { units: [], config: {}, info: {}, viz: {}},
    socket: null,
    initialized: false
  },
})

export default function useWebSocket() {

  const config = computed(() => readonly(ws_data[current_url.value].data.config))
  const units = computed(() => readonly(ws_data[current_url.value].data.units))
  const info = computed(() => readonly(ws_data[current_url.value].data.info))
  const viz = computed(() => readonly(ws_data[current_url.value].data.viz))
  const isInitialized = (url = localhost) => { return ws_data[url].initialized}

  watch([() => ws_data[localhost].socket, () => ws_data[localhost].initialized],() => {
    showLoading.value = !isWSOpen(localhost) || !isInitialized(localhost)
  }, {deep:true})

  const getIP = (url) => { return url.replace("ws://",'').split("/")[0] }

  const getURL = (ip) => {
    if(ip.indexOf(':') == -1) ip += ":7396" // Add default port
    ip = "ws://" + ip + "/api/websocket"
    return ip
  }

  const getBasicObject = () => {
    let obj = {
      data: { units: [], config: {}, info: {}, viz: {}},
      socket: null,
      initialized: false,
    }
    return obj
  }

  const updatePeerConnections = () => {
    let peersArr = getPeers()

    // Remove connections
    for(const peer in JSON.parse(JSON.stringify(ws_data))) {
      if(!peersArr.hasOwnProperty(peer) && peer != localhost) {
        ws_data[peer].socket.close()
        delete ws_data[peer]
      }
    }

    // Add new peers
    for(let i = 0; i < peersArr.length; i++) {
      console.log(peersArr[i])
      if(ws_data.hasOwnProperty(peersArr[i]) && peersArr[i] != localhost) {
        if(!ws_data[peersArr[i]].initialized) openWebSocket(peersArr[i])
      }
      else {
        openWebSocket(peersArr[i])
      }
    }
  }

  const connectedUrls = computed(() => {
    let conns = []
    for(const url in JSON.parse(JSON.stringify(ws_data)))
      if(isWSOpen(url)) conns.push(url)
    return conns
  })

  const getPeers = () => {
    let peers = window.localStorage.getItem("peers")
    if(!peers) return []
    peers =  peers.split(",").map((peerUrl) => {
      peerUrl = getURL(peerUrl)
      return peerUrl
    })

    return peers
  }


  const isWSOpen = (url) => {
    return ws_data[url] && ws_data[url].socket != null && ws_data[url].socket != undefined
      && ws_data[url].socket.readyState == WebSocket.OPEN;
  }

  const openWebSocket = (url) => {
    console.log("Opening a websocket at url:" + url)

    if(!ws_data.hasOwnProperty(url) && url != localhost)
      ws_data[url] = getBasicObject()

    ws_data[url].socket = new WebSocket(url)
    ws_data[url].socket.addEventListener('message', onMessage)
    ws_data[url].socket.addEventListener('open', onOpen)
    ws_data[url].socket.addEventListener('close', onClose)

    setTimeout(() => {
      let socketState = ws_data[url].socket.readyState
      if(socketState == WebSocket.OPEN || socketState == WebSocket.CONNECTING) return
      close(url)
    }, 5000)
  }

  const send = (msg) => {
    let message = JSON.stringify(msg)
    ws_data[current_url.value].socket.send(message)

    console.log("Sending message to server - " + current_url.value + ":" + message)
  }

  const close = (url) => {
    console.log("Closing Websocket connection." + url)
    if(ws_data[url]) ws_data[url].socket.close()
  }

  const onMessage = (event) => {
    let url = event.target.url
    if (!ws_data[url].initialized) {
      console.log("Message received from websocket server: " + event.data)
      ws_data[url].data = JSON.parse(event.data)
      ws_data[url].initialized = true
      ws_data[url].data.viz = {}
    }
    else {
      let updates = JSON.parse(event.data)
      console.log("Message update received." + updates)
      let temp = ws_data[url].data

      if (updates[0] == "viz")
        if(!temp["viz"].hasOwnProperty(updates[1]))
          temp.viz[updates[1]] = { topology: {}, frames: []}

      for (let i = 0; i < updates.length - 1; i++) {
        if (i == updates.length - 2) {
          if (updates[i + 1] == null) {
            if (Array.isArray(temp)) temp.splice(updates[i], 1)
            else delete temp[updates[i]]
          }
          else {
            temp[updates[i]] = updates[i + 1]
            console.log("Updated " + JSON.stringify(temp[updates[i]]) + " -- " + JSON.stringify(updates[i + 1]))
          }
        }
        temp = temp[updates[i]]
      }
    }
  }

  const onOpen = (event) => {
    console.log("Successfully connected to the Server.")
    ws_data[event.target.url].initialized = false
  }

  const onClose = (event) => {
    ws_data[event.target.url].initialized = false
    setTimeout(openWebSocket(event.target.url), 2000)
  }

  return { localhost, current_url, showLoading, units, config, info, viz, isInitialized, getIP, connectedUrls, getPeers,
    isWSOpen, openWebSocket, send, close, updatePeerConnections }
}
