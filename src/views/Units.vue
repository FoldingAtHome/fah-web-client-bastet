<template lang="pug">
.view
  #pauseSettings.modal.fade(ref="pauseSettings" tabindex="-1" data-bs-backdrop="static",
      aria-labelledby="pauseSettingsLabel" aria-hidden="true")
    .modal-dialog
      .modal-content
        .modal-header
          h5#pauseSettingsLabel.modal-title Pause Action
          button.btn-close(type="button" data-bs-dismiss="modal" aria-label="Close")
        .modal-body
          p Would you like to pause folding now or finish all the active work units then pause?
        .modal-footer
          button.settings.btn.btn-primary(type="button" data-bs-dismiss="modal" @click="setPause()") Pause now
          button.settings.btn.btn-primary(type="button" data-bs-dismiss="modal" @click="finishWork()") Finish up, then pause
  UserCard(:key="config.team" :ppd="ppd")
  h2 Work Units
    button.btn.btn-success.pauseBtn(type="button" v-if="areAllUnitsPaused" @click="setPause()") Start
    button.btn.btn-warning.pauseBtn(type="button" v-else data-bs-toggle="modal" data-bs-target="#pauseSettings") Pause
  table.table
    thead
      tr
        th(width="20%")
          | Project (Run, Clone, Gen)
        th(width="30%")
          | Resources
        th(width="15%")
          | Status
        th(width="15%")
          | ETA
        th(width="15%")
          | Progress
        th(width="5%")
          | Delete
    tbody
      template(v-for="(unit, index) in units" :key="index")
        tr(v-if="unit" :class='{ disabled: unit["pause-reason"] }')
          td {{ unitPRCG(index) }}
          td {{ getResources(unit.cpus, unit.gpus) }}
          td {{ getStatus(unit["pause-reason"], unit.state, config["finish"]) }}
          td {{ unit.eta }}
          td
            .progress
              .progress-bar.progress-bar-striped(role="progressbar",
                :class="[unit['pause-reason'] ? 'bg-secondary' : 'progress-bar-animated bg-success']",
                :style="{ width: getProgress(unit['progress']) + '%'}" aria-valuemin="0" aria-valuemax="100")
              span {{ getProgress(unit['progress'], 2) }}%
          td
            a(@click="dumpWU(unit['id'])")
              i.fas.fa-trash-alt(style="color: red;")

</template>

<script>
import useWebSocket from "../composables/useWebSocket";
import UserCard from "../components/UserCard.vue";
import { computed, ref, watch } from 'vue';

export default {
  name: "Units",
  components: { UserCard },
  setup() {
    const { units, config, send } = useWebSocket;
    const ppd = ref(0);
    const pauseSettings = ref(null);

    const areAllUnitsPaused = computed(() => {
      let pausedUnits = 0;
      for(let unit of units.value)
        if(unit["paused"]) pausedUnits++;
      return config.value["paused"] || pausedUnits == units.value.length;
    })

    const status = {
      "DOWNLOAD": "Downloading workunit",
      "CORE": "Downloading core",
      "RUN": "Running",
      "FINISH": "Finishing",
      "UPLOAD": "Uploading",
      "CLEAN": "Finished, Cleaning workunit"
    };

    const getResources = (cpus, gpus) => {
      let msg = "";
      if(cpus > 1) msg += ("cpu:" + cpus + " ");
      if(gpus.length) {
        msg += "gpu:";
        let gpuList = gpus.map(gpu => gpu.split(" ")[0]);
        msg += gpuList.join(", ");
      }
      return msg;
    };

    const getProgress = (progress, precision = 0) => {
      if(isNaN(progress)) return 0;
      return (progress * 100.0).toFixed(precision);
    }

    const showModal = () => {
      let m2 = Modal.getOrCreateInstance(pauseSettings.value);
      m2.show();
    }

    watch([() => units], () => {
      ppd.value = 0;
      for(let unit of units.value)
        if(unit && !unit.hasOwnProperty("pause-reason") && !isNaN(unit['ppd']))
          ppd.value += unit['ppd'];
    }, { deep: true });

    const getStatus = (pauseReason, state, finish) => {
      if(pauseReason && pauseReason != "") return pauseReason;
      if(finish && state == "RUN") return status["FINISH"];
      return status[state];
    };

    const setPause = () => { send({ cmd: areAllUnitsPaused.value ? "unpause" : "pause" }); };
    const finishWork = () => { send({ cmd : "finish" })};

    const dumpWU = (unitId) => {
      console.log("Dumping WU : " + unitId);
      send({ cmd: "dump", unit: unitId});
    };

    const unitPRCG = (index) => {
      const unitData = units.value[index];
      if(unitData && unitData.assignment && unitData.wu)
        return `${unitData.assignment.project} (${unitData.wu.run}, ${unitData.wu.clone}, ${unitData.wu.gen})`;
      return "Will be assigned shortly";
    };

    return { units, config, ppd, pauseSettings, areAllUnitsPaused, getResources, getProgress, showModal, getStatus,
      setPause, finishWork, dumpWU, unitPRCG };
  }
}
</script>

<style lang="stylus" scoped>
.pauseBtn
  margin 10px

tr.disabled
  background-color #d3d3d3

.progress
  position relative
  background-color #aab2ba

.progress > span
  position absolute
  left 0
  width 100%
  text-align center
  z-index 2
  color white

.fa-trash-alt
  pointer-events all
</style>
