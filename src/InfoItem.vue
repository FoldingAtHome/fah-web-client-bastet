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
  props: {
    label:   {},
    content: {},
    bool:    {type: Boolean},
  }
}
</script>

<template lang="pug">
.info-item
  label {{label}}
  span {{bool ? (content ? 'true' : 'false') : content}}
</template>

<style lang="stylus">
.info-group
  display flex
  flex-wrap wrap
  width calc(100% - 1px)
  border var(--table-border)
  border-radius var(--border-radius)
  overflow hidden

  .info-item
    display flex
    flex 1
    background var(--panel-bg)

    > *
      padding calc(var(--gap) / 2) var(--gap)
      width 10em

    label
      background var(--table-header-bg)
      width 8em

    span
      flex 1
      overflow hidden
      text-overflow ellipsis
      white-space nowrap
      font-family var(--mono-font)

@media (max-width 600px)
  .info-group
    flex-direction column
    margin-bottom calc(var(--gap) / 2)
</style>
