<template>
  <div class="view">
    <div class="row">
      <div class="col-md-2 col-sm-2">
      <div class="card">
        <ul class="list-group list-group-flush">
          <li v-for="(unit, index) in units" :key="unit.id" @click="setUnitIndex(index)"
              class="list-group-item" :class="{ active : index == id }">
              WorkUnit {{ index + 1 }}
          </li>
        </ul>
      </div>
    </div>
    <div class="col-md-10 col-sm-10">
      <div class="card h-100">
        <div class="card-body">
          <div ref="root" class="proteinImage">
          </div>
          <div class="row" :style="{ 'margin-top' : '10px' }">
            <div class="col-sm-4 btn-group" role="group">
              <template v-for="view in 3" :key="view">
                <input :id="view" v-model="draw_type" type="radio" class="btn-check" name="view"
                      :value="view" @click="set_draw_type(view)">
                <label class="btn btn-outline-dark" :for="view"> View {{ view }}</label>
              </template>
            </div>
            <div class="col-sm-3">
              <span>Zoom</span>
              <button type="button" class="btn btn-dark" @click="zoom_out"> - </button>
              <button type="button" class="btn btn-dark" @click="zoom_in"> + </button>
            </div>
            <div class="col-sm-5">
              <span>Rotation</span>
              <button type="button" class="btn btn-dark" @click="pause_rotation = !pause_rotation">
                {{ pause_rotation ? "Start" : "Pause" }}
              </button>
              <button type="button" class="btn btn-dark" :disabled="!pause_rotation" @click="rotate(-10)">Left</button>
              <button type="button" class="btn btn-dark" :disabled="!pause_rotation" @click="rotate(10)">Right</button>
            </div>
          </div>
          <br>
          <div class="row">
            <table>
              <td>
                <th>CPUs Assigned</th>
                <tr>{{ unit.cpus }}</tr>
              </td>
              <td>
                <th>Credit</th>
                <tr>{{ unit.assignment.credit }}</tr>
              </td>
              <td>
                <th>Project</th>
                <tr>{{ unit.assignment.project }}</tr>
              </td>
              <td>
                <th>State</th>
                <tr>{{ unit.state }}</tr>
              </td>
              <td>
                <th>Progress</th>
                <tr>{{ (unit.progress*100).toFixed() + '%' || 0 }}</tr>
              </td>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
  </div>
</template>

<script>
import { ref, computed } from '@vue/reactivity'
import { onMounted, onUnmounted } from '@vue/runtime-core'
import useGraphicsLibrary from '../composables/useGraphicsLibrary'
import useWebSocket from '../composables/useWebSocket'
export default {
  name: "Visualization",
  setup() {
    const root = ref(null)

    const { draw_type, pause_rotation, rotate, showProtein, setGraphics, removeGL, set_draw_type, zoom_in, zoom_out }
            = useGraphicsLibrary()
    const { units } = useWebSocket

    const id = ref(0)
    const unit = computed(() => units.value[id.value])

    const setUnitIndex = (index) => {
      id.value = index
      showProtein(units.value[index]["topology"], units.value[index]["frames"][0], root)
    }

    onMounted(() => {
      setGraphics(root);
    })

    onUnmounted(() => {
      removeGL();
    })

    setTimeout(() => {
      showProtein(units.value[id.value]["topology"], units.value[id.value]["frames"][0], root)
    }, 1000)

    return { units, root, id, unit, draw_type, pause_rotation, setUnitIndex, set_draw_type, zoom_in, zoom_out, rotate }
  }
}
</script>

<style scoped>
.proteinImage {
  height: 550px;
  background-color:lightblue;
}

  @media screen and (max-width: 768px){
    .proteinImage {
      height: 300px;
    }
  }

.row {
  margin-top: 5px;
}

@media (max-width: 768px) {
    .row [class*="col-sm-"] {
        margin-top: 5px;
    }
}

.btn-dark {
  margin-left: 5px;
}

.list-group-item.active {
  background-color: black;
}


</style>