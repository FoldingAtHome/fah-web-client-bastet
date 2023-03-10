<!--

                  This file is part of the Folding@home Client.

          The fah-client runs Folding@home protein folding simulations.
                    Copyright (c) 2001-2023, foldingathome.org
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
import util from './util.js'

const api_url = 'https://api.foldingathome.org'


export default {
  props: ['project'],


  data() {
    return {
      img_url: 'data:image/png;base64,',
      more: false
    }
  }
}
</script>

<template lang="pug">
.project(v-if="project.description")
  .project-header
    .project-title
      | Project {{project.id}}
      .project-cause(v-if="project.cause && project.cause != 'unspecified'")
        | {{project.cause}}
      .project-institution {{project.institution}}
      .project-manager {{project.manager}}

  .project-body(:class="{'read-less': !more}")
    .project-details
      .project-description(v-html="project.description")
      img(v-if="project.thumb", :src="img_url + project.thumb")

    p.project-manager
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
    align-items end

    .project-cause
      flex 1

    .project-cause, .project-institution
      color #888
      font-size 90%

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
