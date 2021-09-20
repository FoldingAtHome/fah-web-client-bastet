import { toRefs, reactive } from 'vue';

export default function useWebSocket()
{
    const ws_url = "ws://127.0.0.1:7396/api/websocket";
    const ws_data = reactive({
        data: {},
        socket: null,
        isInitialized: false,
        isWSOpen: 2
    })

    const openWebSocket = () => {
        console.log("Opening a websocket at url:" + ws_url);
        ws_data.socket = new WebSocket(ws_url);
        ws_data.isWSOpen = ws_data.socket.readyState;
        ws_data.socket.addEventListener('message', onMessage);
        ws_data.socket.addEventListener('open', onOpen);
    }

    const send = (msg) => {
        console.log("Sending message to server" + msg);
        ws_data.socket.send(msg);
    }

    const close = () => {
        console.log("Closing Websocket connection.");
        ws_data.socket.close();
    }

    function onMessage(event) {
        if(!ws_data.isInitialized) {
            console.log("Message received from websocket server: " + event.data);
            ws_data.data = JSON.parse(event.data);
            ws_data.isInitialized = true;
        }
        else {
            let updates = JSON.parse(event.data);
            console.log("Message update received." + updates);

            var temp = ws_data.data;

            for(var i = 0; i < updates.length - 1; i++) {
    
                if(i == updates.length - 2) {
                    if(updates[i+1] == null) delete temp[updates[i]];
                    else {
                        console.log(temp[updates[i]] + " -- " + updates[i+1]);
                        temp[updates[i]] = updates[i+1];
                        console.log("Updated " + temp[updates[i]] + " -- " + updates[i+1]);
                    }
                }
                temp = temp[updates[i]];
            } 
        }
    }

    function onOpen(event) {
        console.log("Successfully connected to the Server.");
    }

    return { ...toRefs(ws_data), openWebSocket, send, close}
}