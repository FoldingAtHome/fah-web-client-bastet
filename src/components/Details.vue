<template lang="pug">
.card.h-100
  .card-body
    .row(v-if="unit.hasOwnProperty('assignment')")
      .col-md-3(v-if="response.data && response.data.mthumb")
        img.img-fluid.rounded-start(:src="'data:image/jpeg;base64,' + response.data.mthumb")
      .col
        .card-body(v-if="response.data")
          .card-title Manager: {{ response.data.manager }}
          .center(v-html="response.data.mdescription")
          u.card-title Project Details
          .center(v-html="response.data.description")
    .row(v-else)
      .card-body
        span Current work unit is not assigned yet.
    div.row(v-if="unit.state =='RUN'")
      table
        td
          th CPUs Assigned
          tr {{ unit.cpus }}
        td
          th Credit
          tr {{ unit.assignment.credit }}
        td
          th Project
          tr {{ unit.assignment.project }}
        td
          th State
          tr {{ unit.state }}
        td
          th Progress
          tr {{ (unit.progress*100).toFixed() + '%' || 0 }}
</template>

<script>
import { reactive, computed, watch, toRefs, watchEffect } from "vue";

import useWebSocket from "../composables/useWebSocket";
import { useProjectAPI } from "../composables/useAPI"

export default {
  name: "Details",
  props: {
    unitId : {
      default: 0,
      type: Number
    }
  },
  setup(props) {
    const { units } = useWebSocket
    const { getProjectData, response } = useProjectAPI

    const unit = computed(() => units.value[props.unitId])

    watch([() => props.unitId],() => {
      if(units.value[props.unitId].hasOwnProperty('assignment'))
        getProjectData(units.value[props.unitId].assignment.project);
    });

    if(units.value[props.unitId].hasOwnProperty('assignment'))
      getProjectData(units.value[props.unitId].assignment.project);

    return { unit, response };
  }
}
</script>

<style lang="stylus" scoped>
.card-title
  font-weight: bold

.center
  text-align: left

.list-group-item.active
  background-color: black

.page-item.active .page-link
  background-color: black
  border-color: black

.page-link
  color: black
</style>
