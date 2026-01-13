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
  props: ['progress']
}
</script>

<template lang="pug">
.progress-bar
  .progress(:style="{width: progress + '%'}")
  .progress-text {{progress}}%
</template>

<style lang="stylus">
.progress-bar
  width 100%
  height 1.3rem
  border-radius var(--border-radius)
  overflow hidden
  background var(--progress-bg)
  color var(--progress-fg)

  .progress
    height 100%
    display flex
    text-align center
    white-space nowrap
    transition width .6s ease
    background-color var(--progress-bar)
    background-image var(--progress-img)
    background-size 1rem 1rem

  .progress-text
    width 100%
    text-align center
    margin-top -1.3rem
</style>
