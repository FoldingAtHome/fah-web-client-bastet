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

<template lang="pug">
.fah-logo
  a(href="https://foldingathome.org/", target="_blank")
    div FOLDING
    div #[span @]HOME
</template>

<style lang="stylus">
.fah-logo a
  display inline-block
  font-weight bold
  line-height 0.8em
  font-family mono
  font-size 18pt

  &:visited, &:link
    color var(--logo-color)

  &:hover
    text-decoration none
    color var(--link-color)

  > div:nth-child(1)
    font-size calc(18pt * 5/7)
    transform scaleY(calc(7/5))

  > div
    display flex

    > span
      margin-top -2px
</style>
