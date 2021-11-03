<template lang="pug">
.card.h-100.text-center
  .card-body
    .imageContainer(ref="root")
      .container.center(v-if="!unit.hasOwnProperty('frames')")
        p There are no frames available for this unit.
    .row.mt-2(v-if="unit.hasOwnProperty('frames')")
      .col-lg-3.col-md-3
        nav
          ul.pagination.justify-content-center(v-if="unit.frames.length")
            li.page-item(:class="{ disabled : frameCounter == 0 }" @click="frameCounter--")
              a.page-link(href="#")
                | Prev
            li.page-item(v-for="(frame, index) in (Math.min(3, unit.frames.length))",
                          :class="{ active : frameId == frameCounter + index }", :key="index",
                          @click="frameId = frameCounter + index")
              a.page-link(href="#")
                | {{ frameCounter + index + 1 }}
            li.page-item(:class="{ disabled : frameCounter >= unit.frames.length-3 }" @click="frameCounter++")
              a.page-link(href="#")
                | Next
      .col-lg-3.col-md-3
        span Zoom
        button.btn.btn-dark(type="button" @click="zoom_out")
          | -
        button.btn.btn-dark(type="button" @click="zoom_in")
          | +
      .col-lg-6.col-md-6
        span Rotation
        button.btn.btn-dark(type="button" @click="pause_rotation = !pause_rotation")
          | {{ pause_rotation ? "Start" : "Pause" }}
        button.btn.btn-dark(type="button" :disabled="!pause_rotation" @click="rotate(-10)")
          | Left
        button.btn.btn-dark(type="button" :disabled="!pause_rotation" @click="rotate(10)")
          | Right
      .col-lg-4.col-md-6.btn-group(role="group")
        template(v-for="view in 3" :key="view")
          input.btn-check(:id="view", v-model="draw_type", type="radio", name="view", :value="view",
                         @click="set_draw_type(view)")
          label.btn.btn-outline-dark(:for="view")
            | View {{ view }}
</template>

<script>
import { reactive, computed, ref, toRefs } from '@vue/reactivity'
import { onMounted, onUnmounted, watch, watchEffect } from '@vue/runtime-core'
import useGraphicsLibrary from '../composables/useGraphicsLibrary'
import useWebSocket from '../composables/useWebSocket'
export default {
  name: "Visualization",
  props: {
    unitId : {
      default: 0,
      type: Number
    }
  },
  setup(props) {
    const root = ref(null)

    const { draw_type, pause_rotation, rotate, showProtein, setGraphics, removeGL, clearArea, set_draw_type, zoom_in,
            zoom_out } = useGraphicsLibrary()
    const { units } = useWebSocket

    const data = reactive({
      frameId: 0,
      frameCounter: 0,
    })

    const unit = computed(() => units.value[props.unitId])

    const showImage = (unitId, frameId) => {
      data.frameId = frameId
      if(units.value[unitId].hasOwnProperty('frames'))
        showProtein(units.value[unitId]["topology"], units.value[unitId]["frames"][frameId])
      else
        clearArea();
    };

    watch([() => props.unitId, () => data.frameId], () => {
      showImage(props.unitId, data.frameId);
    });

    onMounted(() => {
      setGraphics(root);
    })

    onUnmounted(() => {
      removeGL();
    })

    setTimeout(() => {
      showImage(props.unitId, 0);
    }, 1000)

    return { ...toRefs(data), root, units, unit, draw_type, pause_rotation, showImage, rotate, set_draw_type, zoom_in,
             zoom_out }
  }
}
</script>

<style lang="stylus" scoped>
.imageContainer
  height: 520px
  background-color: lightblue

  @media screen and (max-width: 768px)
    height: 300px

.center
  height: 100%
  display: table
  text-align: center

.center p
  display: table-cell
  vertical-align: middle

.row [class*="col-md-"]
  margin-top: 5px

li.disabled
  pointer-events: none

button.btn-dark
  margin-left: 5px

.list-group-item.active
  background-color: black

.page-item.active .page-link
  background-color: black
  border-color: black

.page-link
  color: black
</style>