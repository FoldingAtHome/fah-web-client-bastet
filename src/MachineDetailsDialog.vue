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
  props: ['info'],
  components: {GPUFieldset},


  data() {
    return {
      buttons: [{name: 'Ok', icon: 'check'}]
    }
  },


  computed: {
  },


  methods: {
    exec() {return this.$refs.dialog.exec()}
  }
}
</script>

<template lang="pug">
Dialog(ref="dialog", :zIndex="2000", :buttons="[]", :allowClickAway="true",
  class="machine-details-dialog", width="40em")
  template(v-slot:header) Machine Details
  template(v-slot:body)
    fieldset
      legend Machine

      table(v-if="info")
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

    fieldset
      legend CPU

      table(v-if="info")
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
.machine-details-dialog
  max-height 100vh
  max-width 100vw
  overflow auto

  .gpu-icon
    max-height 32px

  fieldset
    padding 0.5em

    > fieldset
      margin-top 1em

  table
    width 100%
    border-collapse collapse

    tr:nth-child(odd)
      background #f3f3f3

    tr:nth-child(even)
      background #fff

    th, td
      border 1px solid #666
      padding 0.125em 0.25em

    th
      vertical-align top
      text-align right
      white-space nowrap
      width 10em

  .dialog-footer
    display none !important
</style>
