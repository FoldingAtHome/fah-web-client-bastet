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
  name: 'NewsView',


  computed: {
    feed() {return this.$news.get_feed()}
  },
}
</script>

<template lang="pug">
.news-view.page-view
  MainHeader

  .view-body
    .header-title(v-if="!feed.length") Loading...

    article.view-panel(v-for="item in feed")
      .article-image
        a(:href="item.url", target="_blank"): img(:src="item.image")

      .article-content
        .article-title
          a(:href="item.url", target="_blank")
            .header-title(v-html="item.title")

        .article-byline
          | By #[span.author {{item.author}}] on #[span.date {{item.date}}].

        .article-body(v-html="item.description")
</template>

<style lang="stylus">
.news-view .view-body
  display flex
  flex-direction column
  gap var(--gap)

  article
    display flex
    flex-direction row-reverse
    gap var(--gap)

    .article-content
      display flex
      flex-direction column
      gap var(--gap)
      flex 1

    .article-title .header-title:hover
      color var(--link-color)

    .article-byline
      font-size 80%

    .article-image img
      max-width 20em
      max-height 10em
      border-radius var(--border-radius)

    .read-more
      font-size 90%

@media (max-width 650px)
  .news-view .view-body article
    flex-direction column
</style>
