<!--

                  This file is part of the Folding@home Client.

          The fah-client runs Folding@home protein folding simulations.
                    Copyright (c) 2001-2026, foldingathome.org
                               All rights reserved.

       This program is free software; you can redistribute it and/or modify
       it under the terms of the GNU General Public License as published by
        the Free Software Foundation; either version 3 of the License, or
                       (at your option) any later version.

         This program is distributed in the hope that it will be useful,
          but WITHOUT ANY WARRANTY; without even the implied warranty of
          MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
                   GNU General Public License for more details.

     You should have received a copy of the GNU General Public License along
     with this program; if not, write to the Free Software Foundation, Inc.,
           51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.

                  For information regarding this software email:
                                 Joseph Coffland
                          joseph@cauldrondevelopment.com

-->

<script>
export default {
  props: ['project', 'full'],


  data() {
    return {
      img_url: 'data:image/png;base64,',
      more: false
    }
  },


  mounted() {
    this.more = this.full

    for (let e of this.$el.querySelectorAll('.project-body a'))
      e.setAttribute('target', '_blank')
  },


  methods: {
    toggle(e) {
      if (this.full) return
      if (e.target.nodeName != 'A') this.more = !this.more
    }
  }
}
</script>

<template lang="pug">
fieldset.project.view-panel(@click="toggle")
  legend Project {{project.id}}

  .project-title
    .project-byline By {{project.manager}}, {{project.institution}}
    .project-cause.header-subtitle Target: {{project.cause}}

  .project-body(:class="{'read-less': !more}")
    .project-details
      .project-image
        img(v-if="project.thumb", :src="img_url + project.thumb")
      .project-description(v-html="project.description")

    .project-manager
      .project-manager-image
        img(v-if="project.mthumb", :src="img_url + project.mthumb")
      .project-manager-description(v-html="project.mdescription")

  .project-footer(v-if="!full")
    .read-more(@click.stop="more = !more") {{more ? '- Collapse' : '+ Expand'}}
</template>

<style lang="stylus">
.project
  .header-title
    margin-bottom var(--gap)

  .project-title
    display flex
    justify-content space-between

    .project-byline
      font-size 80%

    .project-cause
      text-transform capitalize

  .project-body
    overflow hidden

    &.read-less
      mask-image linear-gradient(to bottom, black 50%, transparent 100%)
      max-height 10em

  .project-details, .project-manager
    display flex
    flex-direction column
    gap var(--gap)

  .read-more
    color var(--link-color)
    cursor pointer
    padding var(--gap) 0

  img
    max-height 200px
</style>
