<template>
    <div class="view">
        <h2> Configuration </h2>
        <form>
            <div class="col-md-8 col-lg-7">
                <div class="mb-3">
                    <div class="form-check form-switch">
                        <input class="form-check-input" type="checkbox" id="on_idle" v-model="config.on_idle">
                        <label class="form-check-label" for="on_idle">Use only when idle</label>
                    </div>
                </div>
                <div class="row mb-3">
                    <label class="col-sm-3 col-md-3 col-form-label">Power :</label>
                    <div class="col-sm-9 btn-group" role="group">
                        <template v-for="power in powerValues">
                            <input type="radio" class="btn-check" name="power" :id="power"
                            :value="power.toLowerCase()" v-model="config.power">
                            <label class="btn btn-outline-dark" :for="power">{{ power }}</label>
                        </template>
                    </div>
                </div>
                <div class="row mb-3">
                    <label for="cpus" class="col-sm-3 col-md-3 col-form-label"># of CPUs :</label>
                    <div class="col-sm-9">
                        <input type="number" class="form-control" v-model="config.cpus" min="1" :max="info.cpus-1" id="cpus"
                        :disabled="config.power != 'custom'">
                    </div>
                </div>
                <div class="row mb-3">
                    <label for="key" class="col-sm-3 col-md-3 col-form-label">Key :</label>
                    <div class="col-sm-9">
                        <input type="number" class="form-control" id="key" v-model="config.key" min="0">
                    </div>
                </div>
                <div class="row mb-3">
                    <label class="col-sm-3 col-md-3 col-form-label">Release :</label>
                    <div class="col-sm-9">
                        <select class="form-select" aria-label="Select Release" v-model="config.release">
                            <option v-for="release in releases" :key="release" :value="release.toLowerCase()">
                                {{ release }}
                            </option>
                        </select>
                    </div>
                </div>
                <div class="row mb-3">
                    <label for="cpus" class="col-sm-3 col-md-3 col-form-label">Causes :</label>
                    <div class="col-sm-9">
                        <select class="form-select" aria-label="Select Cause" v-model="config.cause">
                            <option v-for="cause in causes" :key="cause" :value="cause.toLowerCase()">
                                {{ cause }}
                            </option>
                        </select>
                    </div>
                </div>
                <div class="row mb-3">
                    <table>
                        <tr>
                            <th>GPU</th>
                            <th>Enable</th>
                            <th>Options</th>
                        </tr>
                        <tr class="mb-7" v-for="(gpu, index) in config.gpus" :key="index">
                            <td>{{ info.gpus[index].description }}</td>
                            <td>
                                <div class="form-check form-switch">
                                    <input class="form-check-input" type="checkbox" v-model="gpu.enabled">
                                </div>
                            </td>
                            <td>
                                <div class="form-floating">
                                    <textarea class="form-control" placeholder="GPU Options" v-model="gpu.options" id="gpuOptions"></textarea>
                                    <label for="gpuOptions">GPU Options</label>
                                </div>
                            </td>
                        </tr>
                    </table>
                </div>
                <div class="offset-sm-2">
                    <button type="button" v-on:click="clear" class="btn btn-warning">Clear</button>
                    <button type="button" v-on:click="saveSettings" class="btn btn-primary">Save</button>
                </div>
            </div>
        </form>
    </div>
</template>

<script>
import useWebSocket from '../composables/useWebSocket'
import { reactive, toRefs, onBeforeUnmount, watchEffect, computed } from 'vue'

export default {
    name: "Config",
    setup() {
        const { config, info, send } = useWebSocket;

        const cached = reactive({
            causes: ["Any", "Alzheimers", "Cancer", "Huntingtons", "Parkinsons"],
            powerValues: ["Light", "Medium", "Full", "Custom"],
            releases: ["Beta", "Public"],
            config: JSON.parse(JSON.stringify(config.value))
        });

        const update = () => {
            cached.config = JSON.parse(JSON.stringify(config.value))
        }

        const saveSettings = () => {
            console.log("Save Settings called");
            send({ cmd : "config", config : changedData.value});
        }

        const clear = () => {
            console.log("Clear Clicked");
            update();
        }

        const changedData = computed(() => {
            const tmp = JSON.parse(JSON.stringify(cached.config));
            const result = Object.entries(tmp)
                .filter(([key, value]) => {
                    return ((typeof config.value[key] == 'undefined') ||
                            (JSON.stringify(config.value[key]) != JSON.stringify(tmp[key])));
                })
            return Object.fromEntries(result);
        })

        watchEffect(update);

        onBeforeUnmount(() => {
            if(!(JSON.stringify(config.value) === JSON.stringify(cached.config))) {
                var answer = window.confirm('You have unsaved changes!')
                if(answer) saveSettings();
                else clear();
            }
        })

        return { ...toRefs(cached), info, saveSettings, clear };
    }
}

</script>

<style scoped>
.form-check {
    display: inline-block;
}

.col-form-label {
    text-align: left;
}

@media (min-width: 768px) {
    .col-form-label {
        text-align: right;
    }
}
.form-check-input:checked {
    background-color: black;
    border-color: black;
}

button {
    margin: 10px;
}
</style>