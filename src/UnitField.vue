<!--

                  This file is part of the Folding@home Client.

          The fah-client runs Folding@home protein folding simulations.
                    Copyright (c) 2001-2024, foldingathome.org
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
  name: 'UnitField',
  props: ['unit', 'field', 'odd'],
}
</script>

<template lang="pug">
.unit-field(:class="unit.get_field_class(field, odd)",
  :title="unit.get_field_title(field)")
  div(v-if="field.toLowerCase() == 'progress'")
    ProgressBar(:progress="unit.progress")
  div(v-else, v-html="unit.get_field_content(field)")
</template>

<style lang="stylus">
.unit-field
  font-family var(--mono-font)

  > div
    display flex
    gap calc(var(--gap) / 2)
    align-items center

  .eta-warning
    color var(--warn-color)

    .fa
      font-size 10pt

  &.unit-progress > div
    width 100%

  &.unit-status-text
    font-family var(--base-font)

.unit-field, .unit-header
  &.unit-left
    justify-content left

  &.unit-center
    justify-content center

  &.unit-right
    justify-content right
</style>
