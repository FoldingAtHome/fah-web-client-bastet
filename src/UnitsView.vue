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
import Unit from './unit.js'


export default {
  name: 'UnitsView',
  props: {
    units: Array,
    columns: Array
  },
  computed: {Unit() {return Unit}}
}
</script>

<template lang="pug">
template(v-for="(unit, index) in units", :key="unit.id")
  template(v-for="col in columns")
    UnitField(:unit="unit", :field="col", :odd="index & 1")

  .unit-field.unit-actions(:class="`row-${index & 1 ? 'odd' : 'even'}`")
    slot(:unit="unit")
</template>

<style lang="stylus">
.units-view
  display grid
  border-bottom var(--table-border)
  border-right var(--table-border)

  > *
    display flex
    justify-content left
    align-items center
    border-top var(--table-border)
    border-left var(--table-border)
    padding calc(var(--gap) / 2) var(--gap)
    white-space nowrap

  > .unit-header
    color var(--table-header-fg)
    background var(--table-header-bg)

  .unit-status-text
    width 10.5em

  .unit-actions
    gap var(--gap)
    justify-content end

  .row-odd
    background var(--table-odd)

  .row-even
    background var(--table-even)
</style>
