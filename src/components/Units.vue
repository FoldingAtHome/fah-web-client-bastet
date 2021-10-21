<template lang="pug">
.view
  h2 Work Units
    button.btn.pauseBtn(type="button" :class="[!areAllRunning ? 'btn-success' : 'btn-warning']" @click="pauseAll")
      | {{ !areAllRunning ? "Start All" : "Pause All" }}
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
        th(scope="col")
          | Action
    tbody
      template(v-for="(unit, index) in units" :key="index")
        tr(tabindex="0" data-bs-container="body" data-bs-toggle="tooltip" :title="pauseMsg(index)",
           :class='{ disabled: pauseMsg(index) != "" }')
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
          td
            button.btn(type="button", :class="[unit.paused ? 'btn-success' : 'btn-warning']",
                       :disabled='unit.pauseMsg == "resources"',
                       @click="pause(unit.id, unit.paused)")
              | {{ unit.paused ? "Start" : "Pause" }}
</template>

<script>
import { computed } from "@vue/reactivity";
import useWebSocket from "../composables/useWebSocket";

export default {
  name: 'Units',
  setup() {
    var unitMsg = {
      "ASSIGN": "getting assigned.",
      "DOWNLOAD": "downloading...",
      "UPLOAD": "uploading...",
      "CORE": "in core state.",
      "CLEAN": "about to be removed.",
      "DONE": "finished",
    }

    const { units, send } = useWebSocket;
    const pauseMsg = (unitId) => {
      if(!units.value[unitId].hasOwnProperty("pauseMsg")) return ""
      if(units.value[unitId]["pauseMsg"] == "user")
        return "Paused by user.";
      else if(units.value[unitId]["pauseMsg"] == "resources") {
        let gpus = units.value[unitId]["gpus"] != "undefined" ? units.value[unitId]["gpus"].length : 0;
        return ("Requires " + units.value[unitId]["cpus"] + " cpus and " + gpus + " gpus.");
      }
      else return ""
    }

    const areAllRunning = computed(() => {
      let running = true;

      for (var i = 0; i < units.value.length; i++) {
        if (units.value[i]["paused"] == true && units.value[i]["pauseMsg"] != "resources") {
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
      for (var i = 0; i < units.value.length; i++) {
        if(units.value[i]["pauseMsg"] != "resources") {
          let msg = { cmd: areAllRunning.value ? "pause" : "unpause", unit: units.value[i]["id"] };
          send(msg);
        }
      }
    }

    const unitPRCG = (index) => {
      const unitData = units.value[index];
      if(unitData.assignment && unitData.wu)
        return `${unitData.assignment.project} (${unitData.wu.run}, ${unitData.wu.clone}, ${unitData.wu.gen})`
      else
        return "Will be assigned shortly."
    }

    return { units, areAllRunning, unitMsg, unitPRCG, pause, pauseAll, pauseMsg }
  }
}
</script>

<style lang="stylus" scoped>
.pauseBtn
  margin: 10px

tr.disabled
  background-color #d3d3d3
</style>
