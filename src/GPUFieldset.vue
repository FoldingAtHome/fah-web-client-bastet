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
export default {
  props: ['gpu', 'id'],


  computed: {
    devs() {
      let devs = []

      for (const type of ['opencl', 'cuda']) {
        let cinfo = Object.assign({}, this.gpu[type] || {})

        cinfo.supported = cinfo.compute
        cinfo.image = `/images/${cinfo.supported ? '' : 'no-'}${type}.png`

        devs.push(cinfo)
      }

      return devs
    }
  }
}
</script>

<template lang="pug">
fieldset.view-panel
  legend {{id}}
  table.view-table
    tr
      th Description
      td {{gpu.description}}

    tr
      th Supported
      td {{gpu.supported ? 'true' : 'false'}}

    tr
      th Vendor
      td {{gpu.type}}

    tr
      th UUID
      td {{gpu.uuid}}

    tr
      th PCI Device ID
      td 0x{{gpu.device.toString(16)}}

    tr
      th PCI Vendor ID
      td 0x{{gpu.vendor.toString(16)}}

  fieldset.view-panel(v-for="dev of devs")
    legend: img.gpu-icon(:src="dev.image")
    table.view-table
      tr
        th Supported
        td {{dev.supported ? 'true' : 'false'}}

      template(v-if="dev.compute")
        tr
          th Compute
          td {{dev.compute}}

        tr
          th Driver
          td {{dev.driver}}
</template>

<style lang="stylus">
</style>
