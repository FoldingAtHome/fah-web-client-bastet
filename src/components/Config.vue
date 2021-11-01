<template lang="pug">
.view
  h2 Configuration
  form
    .col-md-9.col-lg-8.form-data
      fieldset.form-group.border.p-2.mb-2
        legend.w-auto User Settings
        div
          .row.mb-3
            label.col-sm-3.col-md-3.col-form-label(for="user") Username :
            .col-sm-9
              input#user.form-control(v-model="config.user" type="text")
          .row.mb-3
            label.col-sm-3.col-md-3.col-form-label(for="team") Team Name
            .col-sm-9
              input#team.form-control(v-model="config.team" type="number")
          .row.mb-3
            label.col-sm-3.col-md-3.col-form-label(for="passkey") Pass-key :
            .col-sm-9
              input#passkey.form-control(v-model="config.passkey" pattern="[0-9a-fA-F]{30,32}")
      fieldset.border.p-2.mb-2
        legend.w-auto Project Settings
        div
          .row.mb-3
            label.col-sm-3.col-md-3.col-form-label Release :
            .col-sm-9
              select.form-select(v-model="config.release" aria-label="Select Release")
                option(v-for="release in releases" :key="release" :value="release.toLowerCase()")
                  | {{ release }}
          .row.mb-3
            label.col-sm-3.col-md-3.col-form-label(for="causes") Causes :
            .col-sm-9
              select.form-select(v-model="config.cause" aria-label="Select Cause")
                option(v-for="cause in causes" :key="cause" :value="cause.toLowerCase()") {{ cause }}
          .row.mb-3
            label.col-sm-3.col-md-3.col-form-label(for="key") Project-Key :
            .col-sm-9
              input#key.form-control(v-model="config.key" type="number" min="0")
      fieldset.border.p-2.mb-2
        legend.w-auto Resource Usage
        div
          .mb-3
            .form-check.form-switch
              input#on_idle.form-check-input(v-model="config.on_idle" type="checkbox")
              label.form-check-label(for="on_idle") Use only when idle
          .row.mb-3
            label.col-sm-3.col.md-3.col-form-label(for="cpus")
              | # of CPUs :
            .col-sm-1.col-md-1
              span(for="cpus" :onforminput="value = config.cpus") {{ config.cpus }}
            .col-sm-8
              input#cpus.form-range(v-model="config.cpus" type="range" min="1" :max="info.cpus-1" name="cpus")
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
        button.btn.btn-warning(type="button" @click="clear") Clear
        button.btn.btn-primary(type="button" @click="saveSettings") Save
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
      releases: ["Beta", "Public"],
      config: JSON.parse(JSON.stringify(config.value))
    });

    const update = () => {
      cached.config = JSON.parse(JSON.stringify(config.value))
    }

    const saveSettings = () => {
      console.log("Save Settings.");
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
        var answer = window.confirm('You have unsaved settings changes. What would you like to do with them?')
        if(answer) saveSettings();
        else clear();
      }
    })

    return { ...toRefs(cached), info, saveSettings, clear };
  }
}

</script>

<style lang="stylus" scoped>
form
  text-align: center

.form-data
  display: inline-block

.form-check
  display: inline-block

.col-form-label
  text-align: left

  @media (min-width: 768px)
    text-align: right

.form-check-input:checked
  background-color: black
  border-color: black

legend
  font-weight: bold
  font-size: 20px

button
  margin: 10px

.form-range
  margin-top 3px

  &::-webkit-slider-thumb
    background: black

span
  display: inline-block
  position: relative
  color: white
  line-height: 20px
  text-align: center
  border-radius: 3px
  background: black
  padding: 5px 10px
  margin-left: 4px

span::after
  position: absolute
  top: 8px
  right: -7px
  width: 0
  height: 0
  border-top: 7px solid transparent
  border-left: 7px solid black
  border-bottom: 7px solid transparent
  content: ''
</style>
