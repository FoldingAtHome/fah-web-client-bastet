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

  .view-body(v-if="info")
    fieldset.view-panel
      legend Machine

      .info-group
        info-item(label="Hostname", :content="info.hostname")
        info-item(label="OS",       :content="info.os")

      .info-group
        info-item(label="Client Version", :content="info.version")
        info-item(label="OS Version",     :content="info.os_version")

      .info-group
        info-item(label="Build Mode", :content="info.mode")
        info-item(label="Revision",   :content="info.revision")

      .info-group
        info-item(label="Has Battery", :content="info.has_battery", bool)
        info-item(label="On Battery",  :content="info.on_battery",  bool)

    fieldset.view-panel
      legend CPU

      .info-group
        info-item(label="Description", :content="info.cpu_brand")

      .info-group
        info-item(label="Cores", :content="info.cpus")
        info-item(label="Type",  :content="info.cpu")

    GPUFieldset(v-for="(gpu, id) in info.gpus", :gpu="gpu", :id="id")
</template>

<style lang="stylus">
.machine-details-view
  fieldset
    display flex
    flex-direction column
</style>
