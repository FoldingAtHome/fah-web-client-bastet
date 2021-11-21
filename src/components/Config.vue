<template lang="pug">
.view
  #saveSettings.modal.fade(ref="settingsModal" tabindex="-1" data-bs-backdrop="static" aria-labelledby="saveSettings" aria-hidden="true")
    .modal-dialog
      .modal-content
        .modal-header
          h5#saveSettingsLabel.modal-title Settings
          button.btn-close(type="button" data-bs-dismiss="modal" aria-label="Close")
        .modal-body
          p You have unsaved settings. What would you like to do with them?
        .modal-footer
          button.settings.btn.btn-warning(type="button" @click="check('discard')") Discard
          button.settings.btn.btn-primary(type="button" @click="check('save')") Save
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
            label.col-sm-3.col-md-3.col-form-label(for="team") Team Name :
            .col-sm-6
              input#team.form-control(v-model.number="config.team" type="number" min="0")
            .col
              button.btn.btn-warning(type="button" data-bs-toggle="modal" data-bs-target="#createTeam") Create Team
            CreateTeam
          .row.mb-3
            label.col-sm-3.col-md-3.col-form-label(for="passkey") Passkey :
            .col-sm-9
              input#passkey.form-control(v-model="config.passkey" pattern="[0-9a-fA-F]{30,32}")
      fieldset.border.p-2.mb-2
        legend.w-auto Project Settings
        div
          .mb-3
            .form-check.form-switch
              input#release.form-check-input(v-model="config.release", type="checkbox", true-value="Beta",
                                             false-value="Public")
              label.form-check-label(for="release") Beta Allowed
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
              input#cpus.form-range(v-model.number="config.cpus" type="range" min="1" :max="info.cpus-1" name="cpus")
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
        button.settings.btn.btn-warning(type="button" @click="reset") Discard
        button.settings.btn.btn-primary(type="button" @click="save") Save
</template>

<script>
import { Modal } from  'bootstrap'
import useWebSocket from '../composables/useWebSocket'
import { reactive, toRefs, watchEffect, computed } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'
import CreateTeam from './CreateTeam.vue'

export default {
  name: "Config",
  components: { CreateTeam },
  setup() {
    const { config, info, send } = useWebSocket;
    const cached = reactive({
      causes: ["Any", "Alzheimers", "Cancer", "Huntingtons", "Parkinsons"],
      config: JSON.parse(JSON.stringify(config.value)),
      settingsModal: null,
      nextRoute: null
    });

    const reset = () => {
      cached.config = JSON.parse(JSON.stringify(config.value));
    };

    const save = () => {
      console.log("Save Settings.");
      send({ cmd: "config", config: changedData.value });
    };

    const check = (param) => {
      if(param == 'discard') reset();
      if(param == 'save') save();
      toggleModal(false)
    };

    const changedData = computed(() => {
      const tmp = JSON.parse(JSON.stringify(cached.config));
      const result = Object.entries(tmp).filter(([key]) => {
                      return ((typeof config.value[key] == "undefined") ||
                          (JSON.stringify(config.value[key]) != JSON.stringify(tmp[key])));
        });
      return Object.fromEntries(result);
    });

    watchEffect(reset);

    const toggleModal = (state) => {
      var m2 = Modal.getOrCreateInstance(cached.settingsModal);
      if(state) m2.show();
      else m2.hide();
    }

    onBeforeRouteLeave((to, from, next) => {
      if(!(JSON.stringify(config.value) === JSON.stringify(cached.config))) {
        cached.nextRoute = to;
        toggleModal(true);

        cached.settingsModal.addEventListener('hide.bs.modal', () => {
          next();
        })
      }
      else next();
    })

    return { ...toRefs(cached), info, save, reset, check };
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

button.settings
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
