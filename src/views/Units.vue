<template lang="pug">
.view
  UserCard(:key="config.team" :ppd="ppd")
  h2 Work Units
    button.btn.pauseBtn(type="button" :class="[config.paused ? 'btn-success' : 'btn-warning']"
    @click="setPause(!config.paused)") {{ config.paused ? "Start" : "Pause" }}
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
          td {{ getStatus(unit["pause-reason"], unit.state) }}
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
import { ref, watch } from 'vue';

export default {
  name: "Units",
  components: { UserCard },
  setup() {
    const { units, config, send } = useWebSocket;
    const ppd = ref(0);
    const status = {
      "DOWNLOAD": "Downloading workunit.",
      "CORE": "Downloading core.",
      "RUN": "Running.",
      "UPLOAD": "Uploading",
      "CLEAN": "Finished. Cleaning workunit."
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

    watch([() => units], () => {
      ppd.value = 0;
      for(let unit of units.value)
        if(unit && !unit.hasOwnProperty("pause-reason") && !isNaN(unit['ppd']))
          ppd.value += unit['ppd'];
    }, { deep: true });

    const getStatus = (pauseReason, state) => {
      if(pauseReason && pauseReason != "") return pauseReason;
      return status[state];
    };

    const setPause = (state) => { send({ cmd: state ? "pause" : "unpause" }); };
    const dumpWU = (unitId) => {
      console.log("Dumping WU : " + unitId);
      send({ cmd: "dump", unit: unitId});
    };

    const unitPRCG = (index) => {
      const unitData = units.value[index];
      if(unitData && unitData.assignment && unitData.wu)
        return `${unitData.assignment.project} (${unitData.wu.run}, ${unitData.wu.clone}, ${unitData.wu.gen})`;
      return "Will be assigned shortly.";
    };

    return { units, config, ppd, getResources, getProgress, getStatus, setPause, dumpWU, unitPRCG };
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
