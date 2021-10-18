<template lang="pug">
.view
  h2 Configuration
  form
    .col-md-8.col-lg-7
      .mb-3
        .form-check.form-switch
          input#on_idle.form-check-input(v-model="config.on_idle" type="checkbox")
          label.form-check-label(for="on_idle")
            | Use only when idle
      .row.mb-3
        label.col-sm-3.col-md-3.col-form-label Power :
        .col-sm-9.btn-group(role="group")
          template(v-for="power in powerValues" :key="power")
            input.btn-check(:id="power" v-model="config.power" type="radio" name="power" :value="power.toLowerCase()")
            label.btn.btn-outline-dark(:for="power")
              | {{ power }}
      .row.mb-3
        label.col-sm-3.col-md-3.col-form-label(for="cpus")
          | # of CPUs :
        .col-sm-9
          input#cpus.form-control(v-model="config.cpus", type="number", min="1", :max="info.cpus-1",
                                    :disabled="config.power != 'custom'")
      .row.mb-3
        label.col-sm-3.col-md-3.col-form-label(for="key")
          | Project-Key :
        .col-sm-9
          input#key.form-control(v-model="config.key" type="number" min="0")
      .row.mb-3
        label.col-sm-3.col-md-3.col-form-label Release :
        .col-sm-9
          select.form-select(v-model="config.release" aria-label="Select Release")
            option(v-for="release in releases" :key="release" :value="release.toLowerCase()")
              | {{ release }}
      .row.mb-3
        label.col-sm-3.col-md-3.col-form-label(for="cpus")
          | Causes :
        .col-sm-9
          select.form-select(v-model="config.cause" aria-label="Select Cause")
            option(v-for="cause in causes" :key="cause" :value="cause.toLowerCase()")
              | {{ cause }}
      .row.mb-3
        table
          tr
            th GPU
            th Enable
          tr.mb-7(v-for="(gpu, index) in config.gpus" :key="index")
            td {{ info.gpus[index].description }}
            td
              .form-check.form-switch
                input.form-check-input(v-model="gpu.enabled" type="checkbox")
      .offset-sm-2
        button.btn.btn-warning(type="button" @click="clear")
          | Clear
        button.btn.btn-primary(type="button" @click="saveSettings")
          | Save
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
        const result = Object.entries(tmp).filter(([key]) => {
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

<style lang="stylus" scoped>
.form-check
  display: inline-block

.col-form-label
  text-align: left

  @media (min-width: 768px)
    text-align: right

.form-check-input:checked
  background-color: black
  border-color: black

button
  margin: 10px
</style>
