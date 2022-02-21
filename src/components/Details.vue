<template lang="pug">
.card.h-100
  .card-body
    .row(v-if="unit.hasOwnProperty('assignment')")
      .col-md-3(v-if="response.data && response.data.mthumb")
        img.img-fluid.rounded-start(:src="'data:image/jpeg;base64,' + response.data.mthumb")
      .col
        .card-body(v-if="Object.keys(response.data).length")
          .card-title Manager: {{ response.data.manager }}
          p.card-text(v-if="response.data.institution") {{ response.data.institution }}
          .align-left(v-html="response.data.mdescription")
          u.card-title(v-if="response.data.cause != 'unspecified'")
            | Project {{unit.assignment.project}}: (Fighting {{ toCamelCase(response.data.cause) }})
          u.card-title(v-else)
            | Project {{unit.assignment.project}}
          .align-left(v-html="response.data.description")
    .row(v-else)
      .card-body
        span Current work unit is not assigned yet.
    .row.card-body(v-if="unit")
      table.col-md-8
        td
          th CPUs Assigned
          tr {{ unit.cpus }}
        td(v-if="hasProperty('assignment', 'credit')")
          th Credit
          tr {{ unit.assignment.credit }}
        td
          th State
          tr {{ unit.state }}
        td
          th Progress
          tr {{ (unit.progress*100).toFixed() + '%' || 0 }}
</template>

<script>
import { computed, watch } from "vue"

import useWebSocket from "../composables/useWebSocket"
import useAPI from "../composables/useAPI"

export default {
  name: "Details",
  props: {
    unitId : {
      default: 0,
      type: Number
    }
  },
  setup(props) {
    const { units } = useWebSocket()
    const { getProjectData, project: response } = useAPI()

    const unit = computed(() => units.value[props.unitId])

    watch([() => props.unitId],() => {
      if(unit.value.hasOwnProperty('assignment'))
        getProjectData(unit.value.assignment.project)
    })

    if(unit.value.hasOwnProperty('assignment'))
      getProjectData(unit.value.assignment.project)

    const hasProperty = (key1, key2) => {
      return (unit.value && unit.value.hasOwnProperty(key1) && unit.value[key1].hasOwnProperty(key2))
    }

    const toCamelCase = (str) => {
      if(str) return str[0].toUpperCase() + str.slice(1)
      else return ""
    }

    return { unit, response, hasProperty, toCamelCase }
  }
}
</script>

<style lang="stylus" scoped>
.card-title
  font-weight bold

.align-left
  text-align left

.list-group-item.active
  background-color black

.page-item.active .page-link
  background-color black
  border-color black

.page-link
  color black
</style>
