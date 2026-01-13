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
  props: ['gpu', 'id'],


  computed: {
    devs() {
      let devs = []

      for (const name of ['OpenCL', 'CUDA', 'HIP']) {
        let type  = name.toLowerCase()
        let cinfo = Object.assign({}, this.gpu[type] || {})

        cinfo.name      = name
        cinfo.supported = cinfo.compute
        cinfo.image     = `/images/${cinfo.supported ? '' : 'no-'}${type}.png`

        devs.push(cinfo)
      }

      return devs
    }
  }
}
</script>

<template lang="pug">
fieldset.view-panel.gpu-fieldset
  legend {{id}}
  .info-group
    info-item(label="Description", :content="gpu.description")
    info-item(label="Vendor",      :content="gpu.type")

  .info-group
    info-item(label="Supported", :content="gpu.supported", bool)
    info-item(label="UUID",      :content="gpu.uuid")

  .info-group
    info-item(label="PCI Device ID", :content="'0x' + gpu.device.toString(16)")
    info-item(label="PCI Vendor ID", :content="'0x' + gpu.vendor.toString(16)")

  .info-group(v-for="dev of devs")
    info-item(:label="dev.name",
      :content="(dev.supported ? '' : 'un') + 'supported'")

    template(v-if="dev.compute")
      info-item(label="Compute", :content="dev.compute")
      info-item(label="Driver",  :content="dev.driver")
</template>

<style lang="stylus">
</style>
