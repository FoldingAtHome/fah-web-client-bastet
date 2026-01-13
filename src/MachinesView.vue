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

  .view-body
    .machines-view-header.view-panel
      .no-data(v-if="$machs.is_empty")
        p No folding machines found.
        p Login or install the Folding@home client software.
        p.
         If you are using Brave browser, please use "Shields Down" for
         this site.

      template(v-else)
        <!--plot-view(:x="$machs.ppd", :min="1000000")-->

        table.machines-info.view-table
          thead
            tr
              th Total PPD
              th Actions

          tbody
            tr
              td(title="Current total estimated Points Per Day")
                | {{$machs.ppd.toLocaleString()}}
              td
                .machines-actions
                  Button(text="Fold All",
                  @click="$root.fold()", success, icon="play",
                  :disabled="$machs.is_empty",
                  title="Start folding on all machines")

                  Button(text="Pause All",
                    @click="$root.pause()", icon="pause",
                    :disabled="$machs.is_empty",
                    title="Pause folding on all machines")

    template(v-for="mach in machs")
      MachineView(v-if="!mach.is_hidden()", :mach="mach")
</template>

<style lang="stylus">
.machines-view .view-body
  .machines-view-header
    display flex
    flex-direction column
    padding 0

    .no-data
      text-align center

    .plot-view
      height 100px

    .machines-info
      th, td
        text-align right

      > thead > tr > th:last-of-type
        width 100%

      .machines-actions
        justify-content end
        display flex
        gap var(--gap)

@media (max-width 600px)
  .machines-view .view-body
    .machines-view-header .machines-info
      .machines-actions
        .button > span
          display none
</style>
