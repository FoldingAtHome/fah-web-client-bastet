<template>
  <div class="view">
    <div class="row">
      <div class="col-md-2 col-sm-2">
      <div class="card">
        <ul class="list-group list-group-flush">
          <li v-for="(unit, index) in units" :key="index" @click="showImage(index, 0)"
              class="list-group-item" :class="{ active : index == unitId }">
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
          <div class="row" :style="{ 'margin-top' : '5px' }">
            <div class="col-lg-3 col-md-3">
              <nav>
                <ul v-if="unit.frames.length" class="pagination justify-content-center">
                  <li class="page-item" :class="{ disabled : frameCounter == 0 }" @click="frameCounter--">
                    <a class="page-link" href="#">Prev</a>
                  </li>
                  <li class="page-item" v-for="(frame, index) in (Math.min(3, unit.frames.length))" :class="{ active : frameId == frameCounter + index }"
                      :key="index" @click="showImage(unitId, frameCounter + index)">
                    <a class="page-link" href="#">{{ frameCounter + index + 1 }}</a>
                  </li>
                  <li class="page-item" :class="{ disabled : frameCounter >= unit.frames.length-3 }" @click="frameCounter++">
                    <a class="page-link" href="#">Next</a>
                  </li>
                </ul>
              </nav>
            </div>
            <div class="col-lg-3 col-md-3">
              <span>Zoom</span>
              <button type="button" class="btn btn-dark" @click="zoom_out"> - </button>
              <button type="button" class="btn btn-dark" @click="zoom_in"> + </button>
            </div>
            <div class="col-lg-6 col-md-6">
              <span>Rotation</span>
              <button type="button" class="btn btn-dark" @click="pause_rotation = !pause_rotation">
                {{ pause_rotation ? "Start" : "Pause" }}
              </button>
              <button type="button" class="btn btn-dark" :disabled="!pause_rotation" @click="rotate(-10)">Left</button>
              <button type="button" class="btn btn-dark" :disabled="!pause_rotation" @click="rotate(10)">Right</button>
            </div>
            <div class="col-lg-4 col-md-6 btn-group" role="group">
              <template v-for="view in 3" :key="view">
                <input :id="view" v-model="draw_type" type="radio" class="btn-check" name="view"
                      :value="view" @click="set_draw_type(view)">
                <label class="btn btn-outline-dark" :for="view"> View {{ view }}</label>
              </template>
            </div>
          </div>
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
import { reactive, computed, ref, toRefs } from '@vue/reactivity'
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

    const data = reactive({
      unitId: 0,
      frameId: 0,
      frameCounter: 0,
    })

    const unit = computed(() => units.value[data.unitId])

    const showImage = (unitId, frameId) => {
      data.unitId = unitId
      data.frameId = frameId
      showProtein(units.value[unitId]["topology"], units.value[unitId]["frames"][frameId])
    }

    onMounted(() => {
      setGraphics(root);
    })

    onUnmounted(() => {
      removeGL();
    })

    setTimeout(() => {
      showProtein(units.value[data.unitId]["topology"], units.value[data.unitId]["frames"][0])
    }, 1000)

    return { ...toRefs(data), root, units, unit, draw_type, pause_rotation, showImage, rotate, set_draw_type, zoom_in,
             zoom_out }
  }
}
</script>

<style scoped>
.proteinImage {
  height: 520px;
  background-color:lightblue;
}

@media screen and (max-width: 768px){
  .proteinImage {
    height: 300px;
  }
}

.row [class*="col-md-"]{
  margin-top: 5px;
}

li.disabled {
  pointer-events: none;
}

.btn-dark {
  margin-left: 5px;
}

.list-group-item.active {
  background-color: black;
}

.page-item.active .page-link {
  background-color: black;
  border-color: black;
}

.page-link {
  color: black;
}
</style>