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
  name: 'ViewHeader',
  props: ['title', 'subtitle'],


  methods: {
    close() {
      this.$router.back()
    }
  }
}
</script>

<template lang="pug">
.view-header
  .header-top
    FAHLogo

    .header-center
      slot(name="center")
        .header-title(v-if="title") {{title}}
        .header-subtitle(v-if="subtitle") {{subtitle}}

    .header-actions
      slot(name="actions")
        Button(text="Close", icon="times", @click="close")

  .header-menu
    slot(name="menu")
</template>

<style lang="stylus">
.page-view .view-header
  display flex
  flex-direction column
  color var(--header-fg)
  background var(--header-bg)
  border var(--border)
  border-radius var(--border-radius)
  overflow hidden

  .header-top
    display flex
    justify-content space-between
    align-items center
    gap var(--gap)
    padding var(--gap) calc(var(--gap) * 1.5)

    a:hover
      text-decoration none

    .header-center
      display flex
      flex-direction column
      gap var(--gap)

    .header-actions
      align-items end
      display flex
      flex-direction row
      justify-content right
      gap var(--gap)

      .button-icon
        width 1.25em
        font-size 130%

        &:not(:hover)
          &:not(.button-disabled)
            color var(--header-fg)

        &:hover
          &:not(.button-disabled)
            color var(--link-color)

@media (max-width 800px)
  .page-view .view-header
    .control .button-content
      display none
</style>
