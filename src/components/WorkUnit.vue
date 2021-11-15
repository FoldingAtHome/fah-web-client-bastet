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
          ul.nav.nav-tabs.card-header-tabs
            li.nav-item(:class="{ active : isActive('visualize') }")
              a.nav-link(aria-current="true" @click.prevent="setActiveTab('visualize')" href="#visualize") Visualization
            li.nav-item(:class="{ active : isActive('details') }")
              a.nav-link(@click.prevent="setActiveTab('details')" href="#details") Details
        Details(v-if="isActive('details')" :unitId="data.unitId")
        Visualization(v-else :unitId="data.unitId")
</template>

<script>
import { reactive } from "@vue/reactivity";
import useWebSocket from "../composables/useWebSocket";
import Details from "./Details.vue";
import Visualization from "./Visualization.vue";
export default {
    name: "WorkUnit",
    components: { Details, Visualization },
    setup() {
        const data = reactive({
            unitId: 0,
            activeTab: "visualize"
        });
        const { units } = useWebSocket
        const isActive = (tab) => { return data.activeTab === tab };
        const setIndex = (index) => data.unitId = index;
        const setActiveTab = (tab) => data.activeTab = tab;
        return { data, units, setIndex, setActiveTab, isActive };
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
</style>