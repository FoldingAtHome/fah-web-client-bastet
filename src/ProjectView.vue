<script>
import util from './util.js'

const api_url = 'https://api.foldingathome.org'


export default {
  props: ['id'],


  data() {
    return {
      img_url: 'data:image/png;base64,',
      project: {},
      more: false
    }
  },


  async mounted() {
    let p = util.retrieve('fah-project-' + this.id)
    if (p) return this.project = p

    let r = await fetch(api_url + '/project/' + this.id)
    if (r.ok) {
      this.project = await r.json()
      util.store('fah-project-' + this.id, this.project)
    }
  }
}
</script>

<template lang="pug">
.project(v-if="project.description")
  .project-header
    .project-title
      | Project {{id}}
      .project-cause(v-if="project.cause && project.cause != 'unspecified'")
        | {{project.cause}}

  .project-body(:class="{'read-less': !more}")
    .project-details
      .project-description(v-html="project.description")
      img(v-if="project.thumb", :src="img_url + project.thumb")

    h3 {{project.manager}}
    h4(v-html="project.institution")
    .project-manager
      .project-manager-description(v-html="project.mdescription")
      img(v-if="project.mthumb", :src="img_url + project.mthumb")

  .project-footer
    .read-more(@click="more = !more") Read {{more ? 'less' : 'more'}}
</template>

<style lang="stylus">
@import('colors.styl')

.project
  border 1px solid border-color
  padding 1em
  margin 0.5em 0
  background panel-bg

  .project-body
    overflow hidden

    &.read-less
      max-height 5em

  .project-title
    font-size 120%
    font-weight bold
    margin-bottom 0.5em
    display flex
    gap 0.5em
    text-transform capitalize

    .project-cause
      color #888

  .project-details, .project-manager
    display flex
    flex-direction row
    align-items top
    gap 0.5em

    .project-description, .project-manager-description
      p
        margin 0

  .read-more
    color link-color
    cursor pointer
    padding 0.5em 0

  img
    max-height 200px
</style>
