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
  computed: {
    feed() {return this.$news.get_feed()}
  },
}
</script>

<template lang="pug">
.news-feed
  h2 Folding@home News
  h3(v-if="!feed.length") Loading...

  article(v-for="item in feed")
    a(:href="item.url", target="_blank"): img.image(:src="item.image")
    a.title(:href="item.url", target="_blank"): h3(v-html="item.title")
    .byline By #[span.author {{item.author}}] on #[span.date {{item.date}}].
    p(v-html="item.description")
    .clear
</template>

<style lang="stylus">
@import('colors.styl')

.news-feed
  article
    background panel-bg
    border 1px solid border-color
    padding 0 1em
    margin 1em auto
    max-width 60em

    > .title
      color body-fg

      &:hover
        color link-color

    > .byline
      font-size 80%
      margin-bottom 1em

    > a .image
      float right
      max-width 20em
      max-height 10em
      margin 1em 0 1em 1em

    > .clear
      clear both

@media (max-width 650px)
  .news-feed article > a .image
    max-width 10em
</style>
