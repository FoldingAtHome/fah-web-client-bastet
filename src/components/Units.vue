<template>
    <div>
        <br/>
        <h2>Work Units      
            <button type="button" @click="pauseAll" ref="toggleAll" class="btn" 
            :class="[ !areAllPaused ? 'btn-success' : 'btn-warning']">
                {{ !areAllPaused ? "Start All" : "Pause All" }}
            </button>
        </h2>
        <table class="table">
            <thead>
                <tr>
                <th scope="col">#</th>
                <th scope="col">Name</th>
                <th scope="col">State</th>
                <th scope="col">Progress</th>
                <th scope="col">Action</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(unit, index) in data['units']" :key="index">
                    <th scope="row">{{ index + 1 }}</th>
                    <td>WorkUnit {{ index + 1 }} </td>
                    <td>{{ unit["state"] }}</td>
                    <td>
                        <div class="progress">
                            <div class="progress-bar progress-bar-striped progress-bar-animated bg-success " role="progressbar" 
                            :style="{ width: unit['progress']*100 + '%'}" aria-valuenow="50"
                            aria-valuemin="0" aria-valuemax="100">{{ (unit['progress']*100).toFixed() }}%</div>
                        </div>
                    </td>
                    <td>
                        <button type="button" v-on:click="pause(index)" class="btn" 
                        :class="[ unit['paused'] ? 'btn-success' : 'btn-warning']">
                            {{ unit['paused'] ? "Start" : "Pause" }}
                        </button>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
import { ref } from "@vue/reactivity";
import useWebSocket from "../composables/useWebSocket";

export default {
    name: 'Units',
    setup() {

        const { data, send }  = useWebSocket;

        const areAllPaused = ref(false)

        const update = () => {
            let paused = true;
                
            for(var i = 0; i < data.value.units.length; i++) {
                if(data.value.units[i]["paused"] == false) {
                    paused = false;
                    break;
                }
            }
            areAllPaused.value = paused
            return paused;
        };

        const toggleAll = ref(null);

        const pause = (id) => {

            update();

            let isPaused = false;
            if(data.value.units.hasOwnProperty(id))
                isPaused = data.value.units[id]["paused"];

            let msg = { cmd: isPaused ? "unpause" : "pause", unit: id }
            send(msg);   
        }

        const pauseAll = () => {
            update();
            let msg = { cmd: areAllPaused.value ? "unpause" : "pause" }
            send(msg);
        }

        return { data, pause, areAllPaused, pauseAll, toggleAll}
    }
}
</script>