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
import MachineView from './MachineView.vue'


function mach_cmp(a, b) {
  let cmp = b.is_direct() - a.is_direct()
  if (cmp) return cmp

  cmp = b.is_connected() - a.is_connected()
  if (cmp) return cmp

  return a.get_name().localeCompare(b.get_name())
}


export default {
  name: 'MachinesView',
  components: {MachineView},


  computed: {
    machs() {return Array.from(this.$machs).sort(mach_cmp)}
  }
}
</script>

<template lang="pug">
.machines-view.page-view
  MainHeader
    template(v-slot:center)
      Button.button-success(text="Fold", @click="$root.fold()",
        icon="play", :disabled="$machs.is_empty()")

      Button(text="Pause", @click="$root.pause()", icon="pause",
        :disabled="$machs.is_empty()")

  .view-body
    MachineView(v-for="mach in machs", :mach="mach")

    .no-data(v-if="$machs.is_empty()")
      td(colspan="100")
        p No folding machines found.
        p Login or install the Folding@home client software.
</template>

<style lang="stylus">
.machines-view .view-body
  display flex
  flex-direction column
  gap 1em
</style>
