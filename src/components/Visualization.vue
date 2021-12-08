<template lang="pug">
.card.h-100.text-center
  .card-body
    .imageContainer(ref="root")
      .container.center(v-if="!unitHasFrames")
        p There are no frames available for this unit.
    .row.mt-2(v-if="unitHasFrames")
      .col-lg-4.col-md-4.col-sm-6
        nav
          ul.pagination.justify-content-center(v-if="framesLength")
            li.page-item(:class="{ disabled : frameCounter == 0 }" @click="frameCounter--")
              a.page-link(href="#")
                | Prev
            li.page-item(v-for="(frame, index) in (Math.min(3, framesLength))",
                          :class="{ active : frameId == frameCounter + index }", :key="index",
                          @click="showImage(props.unitId, frameCounter + index)")
              a.page-link(href="#")
                | {{ frameCounter + index + 1 }}
            li.page-item(:class="{ disabled : frameCounter >= framesLength-3 }" @click="frameCounter++")
              a.page-link(href="#")
                | Next
      .col-lg-3.col-md-2.col-sm-6
        span View
        button.btn.btn-dark.dropdown-toggle(data-bs-toggle="dropdown" aria-expanded="false")
          | {{ view[draw_type] }}
        ul.dropdown-menu
          li(v-for="index in Object.keys(view)" :key="index")
            button.dropdown-item(@click="set_draw_type(index)" :value="index") {{ view[index] }}
</template>

<script>
import { reactive, computed, ref, toRefs } from '@vue/reactivity'
import { onMounted, onUnmounted, watch } from 'vue'
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

    const { draw_type, showProtein, setGraphics, removeGL, clearArea, set_draw_type } = useGraphicsLibrary()
    const { units } = useWebSocket

    const view = {
      1: "Ball and Stick",
      2: "Stick",
      3: "Space Filled"
    }

    const data = reactive({
      frameId: 0,
      frameCounter: 0,
    })

    const unitHasFrames = computed(() => units.value[props.unitId].hasOwnProperty('frames'))
    const framesLength = computed(() => {
      let unit = units.value[props.unitId]
      if(unit && unit.hasOwnProperty('frames')) return unit.frames.length;
      else return 0;
    })

    const showImage = (unitId, frameId) => {
      data.frameId = frameId
      if(units.value[unitId].hasOwnProperty('frames'))
        showProtein(units.value[unitId]["topology"], units.value[unitId]["frames"][frameId])
      else
        clearArea();
    };

    watch([() => props.unitId], () => {
      data.frameId = 0;
      data.frameCounter = 0;
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

    return { ...toRefs(data), view, props, root, draw_type, unitHasFrames, framesLength, showImage, set_draw_type }
  }
}
</script>

<style lang="stylus" scoped>
.imageContainer
  height: 590px
  background-color: lightblue

  @media screen and (max-width: 768px)
    height: 300px

.card-body
  padding: 0.5rem
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

.dropdown-toggle
  padding: 0.2rem 0.75rem
</style>