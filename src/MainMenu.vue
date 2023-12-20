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
  name: 'MainMenu',
}
</script>

<template lang="pug">
.view-menu
  router-link(to="/machines") Machines
  router-link(to="/stats") Stats
  router-link(to="/projects") Projects
  router-link(to="/news") News
</template>

<style lang="stylus">
.view-menu
  display flex
  justify-content space-between
  background var(--header-bg)
  font-size 12pt
  padding 0 1em

  > a
    display block
    padding 0 0.5em 0.3em 0.5em
    border-bottom 3px solid var(--header-bg)
    white-space nowrap
    color var(--header-fg)

    &:hover, &.router-link-active
      text-decoration none

    &:hover
      border-color var(--link-alt)

    &.router-link-active
      border-color var(--link-color)

@media (max-width 800px)
  .view-menu
    font-size 10pt
</style>
