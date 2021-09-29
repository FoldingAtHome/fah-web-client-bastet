<template>
    <div class="view">
        <h2>Work Units
            <button type="button" @click="pauseAll" class="btn pauseBtn"
            :class="[ !areAllRunning ? 'btn-success' : 'btn-warning']">
                {{ !areAllRunning ? "Start All" : "Pause All" }}
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
                <tr v-for="(unit, index) in units" :key="index">
                    <th scope="row">{{ index + 1 }}</th>
                    <td>WorkUnit {{ index + 1 }} </td>
                    <td>{{ unit.state }}</td>
                    <td>
                        <div class="progress" v-if="unit.state == 'RUN'">
                            <div class="progress-bar progress-bar-striped" role="progressbar"
                            :class="[ unit.paused ? 'bg-secondary' : 'progress-bar-animated bg-success']"
                            :style="{ width: unit.progress*100 + '%'}" aria-valuenow="50"
                            aria-valuemin="0" aria-valuemax="100">{{ (unit.progress*100).toFixed() }}%</div>
                        </div>
                        <div v-else>Unit is downloading...</div>
                    </td>
                    <td>
                        <button type="button" v-on:click="pause(unit.id, unit.paused)" class="btn" v-if="unit.state =='RUN'"
                        :class="[ unit.paused ? 'btn-success' : 'btn-warning']">
                            {{ unit.paused ? "Start" : "Pause" }}
                        </button>
                        <div v-else>None</div>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
import { computed } from "@vue/reactivity";
import useWebSocket from "../composables/useWebSocket";

export default {
    name: 'Units',
    setup() {

        const { units, send }  = useWebSocket;

        const areAllRunning = computed(() => {
            let running = true;

            for(var i = 0; i < units.value.length; i++) {
                if(units.value[i]["paused"] == true) {
                    running = false;
                    break;
                }
            }
            return running;
        })

        const pause = (id, isPaused) => {
            let msg = { cmd: isPaused ? "unpause" : "pause", unit: id };
            send(msg);
        }

        const pauseAll = () => {
            let msg = { cmd: areAllRunning.value ? "pause" : "unpause" };
            send(msg);
        }

        return { units, areAllRunning, pause, pauseAll }
    }
}
</script>

<style scoped>
.pauseBtn {
    margin: 10px;
}
</style>