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
import GPUFieldset from './GPUFieldset.vue'


export default {
  props: ['mach'],
  components: {GPUFieldset},


  computed: {
    info() {return this.mach.get_info()}
  }
}
</script>

<template lang="pug">
.machine-details-view.page-view
  ViewHeader(title="Machine Details", :subtitle="mach.get_name()")

  .view-body
    fieldset.view-panel
      legend Machine

      table.view-table(v-if="info")
        tr
          th Hostname
          td {{info.hostname}}

        tr
          th Client Version
          td {{info.version}}

        tr
          th OS
          td {{info.os}}

        tr
          th OS Version
          td {{info.os_version}}

    fieldset.view-panel
      legend CPU

      table.view-table(v-if="info")
        tr
          th Description
          td {{info.cpu_brand}}

        tr
          th Type
          td {{info.cpu}}

        tr
          th Cores
          td {{info.cpus}}

    GPUFieldset(v-for="(gpu, id) in info.gpus", :gpu="gpu", :id="id")
</template>

<style lang="stylus">
.machine-details-view
  .gpu-icon
    max-height 32px

  fieldset
    display flex
    flex-direction column
    padding 0.5em
    width 100%

    > fieldset
      margin-top 1em

  table.view-table
    width 100%

    td, th
      white-space normal

    th
      width 8.5em
</style>
