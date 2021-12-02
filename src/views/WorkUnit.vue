<template lang="pug">
.view
  .row
    .col-md-2.col-sm-2
      .card
        ul.list-group.list-group-flush
          li.list-group-item(v-for="(unit, index) in units", :key="index", @click="setIndex(index)",
                            :class="{ active : index == data.unitId }")
            | WorkUnit {{ index + 1 }}
    .col-md-10.col-sm-10
      .card.h-100.text-center
        .card-header
          .row
            .col-sm-11.col-xs-10
              ul.nav.nav-tabs.card-header-tabs
                li.nav-item(:class="{ active : isActive('visualize') }")
                  a.nav-link(aria-current="true" @click.prevent="setActiveTab('visualize')"
                    href="#visualize") Visualization
                li.nav-item(:class="{ active : isActive('details') }")
                  a.nav-link(@click.prevent="setActiveTab('details')" href="#details") Details
            .col-sm-1.col-xs-2(v-if="isActive('visualize')")
              a(ref="popper" tabindex="0" role="button" data-bs-toggle="popover" data-bs-placement="bottom"
                data-bs-trigger="hover" data-bs-html="true")
                i.fas.fa-info-circle.fa-2x
        Details(v-if="isActive('details')" :unitId="data.unitId")
        Visualization(v-else :unitId="data.unitId")
</template>

<script>
import { ref, reactive, onMounted, onUnmounted } from "vue";
import { Popover } from 'bootstrap';
import useWebSocket from "../composables/useWebSocket";
import Details from "../components/Details.vue";
import Visualization from "../components/Visualization.vue";
export default {
  name: "WorkUnit",
  components: { Details, Visualization },
  setup() {
    const popper = ref()
    const data = reactive({
      unitId: 0,
      activeTab: "visualize",
      popover: null
    });
    const { units } = useWebSocket
    const isActive = (tab) => { return data.activeTab === tab };
    const setIndex = (index) => data.unitId = index;
    const setActiveTab = (tab) => data.activeTab = tab;

    onMounted(() => {
      data.popover = new Popover(popper.value, {
        content: "Start/Stop Rotation: Press Spacebar or double click. <br />" +
                 "Rotate Left/Right: Hold mouse click and rotate. <br />" +
                 "Zoom In/Out: Press (+ or -) or scroll mouse-wheel. <br />" +
                 "Toggle View: Press (1 or 2 or 3).",
        title: "How to use?",
      })
      data.popover.show();
      setTimeout(() => data.popover.hide(), 3000);
    })

    onUnmounted(() => { data.popover.hide(); })

    return { popper, data, units, setIndex, setActiveTab, isActive };
  }
}
</script>

<style lang="stylus" scoped>
.list-group-item.active, .card-header
  background-color: black

.page-item.active
  background-color: black
  border-color: black

.nav-item > .nav-link
  color: black
  background-color: rgb(220, 220, 220)

.nav-item.active > .nav-link
  background-color: white

.fa-2x
  font-size: 1.5rem
  color: white
  margin-top:0.25rem
</style>