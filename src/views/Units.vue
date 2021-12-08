<template lang="pug">
.view
  UserCard(:key="config.team")
  h2 Work Units
    button.btn.pauseBtn(type="button" :class="[config.paused ? 'btn-success' : 'btn-warning']" 
    @click="setPause(!config.paused)") {{ config.paused ? "Start" : "Pause" }}
  table.table
    thead
      tr
        th(width="20%")
          | Project (Run, Clone, Gen)
        th(width="25%")
          | Resources
        th(width="25%")
          | Status
        th(width="30%")
          | Progress
    tbody
      template(v-for="(unit, index) in units" :key="index")
        tr(v-if="unit" :class='{ disabled: unit["pause-reason"] }')
          td {{ unitPRCG(index) }}
          td {{ getResources(unit.cpus, unit.gpus) }}
          td {{ getStatus(unit["pause-reason"], unit.state) }}
          td
            .progress
              .progress-bar.progress-bar-striped(role="progressbar",
                :class="[unit['pause-reason'] ? 'bg-secondary' : 'progress-bar-animated bg-success']",
                :style="{ width: unit.progress * 100 + '%' }" aria-valuenow="50" aria-valuemin="0" aria-valuemax="100")
                | {{ (unit.progress * 100).toFixed() | 0 }}%
</template>

<script>
import useWebSocket from "../composables/useWebSocket";
import UserCard from "../components/UserCard.vue";

export default {
  name: "Units",
  components: { UserCard },
  setup() {
    const { units, config, send } = useWebSocket;
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

    const getStatus = (pauseReason, state) => {
      if(pauseReason && pauseReason != "") return pauseReason;
      return status[state];
    };

    const setPause = (state) => { send({ cmd: state ? "pause" : "unpause" }); };
    const unitPRCG = (index) => {
      const unitData = units.value[index];
      if(unitData && unitData.assignment && unitData.wu)
        return `${unitData.assignment.project} (${unitData.wu.run}, ${unitData.wu.clone}, ${unitData.wu.gen})`;
      return "Will be assigned shortly.";
    };
    return { units, config, getResources, getStatus, setPause, unitPRCG };
  }
}
</script>

<style lang="stylus" scoped>
.pauseBtn
  margin: 10px

tr.disabled
  background-color #d3d3d3
</style>
