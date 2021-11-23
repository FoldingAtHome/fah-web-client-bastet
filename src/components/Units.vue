<template lang="pug">
.view
  h2 Work Units
    button.btn.pauseBtn(type="button" :class="[config.paused ? 'btn-success' : 'btn-warning']" @click="setPause(!config.paused)")
      | {{ config.paused ? "Start" : "Pause" }}
  table.table
    thead
      tr
        th(scope="col")
          | #
        th(scope="col")
          | Project (Run, Clone, Gen)
        th(scope="col")
          | State
        th(scope="col")
          | Progress
    tbody
      template(v-for="(unit, index) in units" :key="index")
        tr(v-if="unit" tabindex="0" data-bs-container="body" data-bs-toggle="tooltip" :title="unit['pause-reason']",
           :class='{ disabled: unit["pause-reason"] }')
          th(scope="row") {{ index + 1 }}
          td {{ unitPRCG(index) }}
          td {{ unit.state }}
          td
            .progress(v-if="unit.state == 'RUN'")
              .progress-bar.progress-bar-striped(role="progressbar",
                :class="[unit.paused ? 'bg-secondary' : 'progress-bar-animated bg-success']",
                :style="{ width: unit.progress * 100 + '%' }" aria-valuenow="50" aria-valuemin="0" aria-valuemax="100")
                | {{ (unit.progress * 100).toFixed() }}%
            div(v-else)
              | Unit is {{ unitMsg[unit.state] }}
</template>

<script>
import useWebSocket from "../composables/useWebSocket";

export default {
  name: 'Units',
  setup() {
    let pauseReason = {
      "resources": "Resources not available.",
      "user": "Paused by user."
    }

    let unitMsg = {
      "ASSIGN": "getting assigned.",
      "DOWNLOAD": "downloading...",
      "UPLOAD": "uploading...",
      "CORE": "in core state.",
      "CLEAN": "about to be removed.",
      "DONE": "finished",
    }

    const { units, config, send } = useWebSocket;


    const setPause = (state) => {
      let msg = { cmd: state ? "pause" : "unpause" };
      send(msg);
    }

    const unitPRCG = (index) => {
      const unitData = units.value[index];
      if(unitData && unitData.assignment && unitData.wu)
        return `${unitData.assignment.project} (${unitData.wu.run}, ${unitData.wu.clone}, ${unitData.wu.gen})`
      else
        return "Will be assigned shortly."
    }

    return { units, config, unitMsg, pauseReason, unitPRCG, setPause }
  }
}
</script>

<style lang="stylus" scoped>
.pauseBtn
  margin: 10px

tr.disabled
  background-color #d3d3d3
</style>
