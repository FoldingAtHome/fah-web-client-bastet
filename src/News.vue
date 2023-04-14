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
import {reactive} from 'vue'
import Cookie from './cookie.js'
import util   from './util.js'


const api_base = 'https://foldingathome.org/wp-json/wp/v2'
const feed_timeout = 24 * 60 * 60 * 1000


function get_featured_image(article, post) {
  return fetch(api_base + `/media/${post.featured_media}?context=embed`)
    .then(r => r.json())
    .then(media => {
      article.image = media.media_details.sizes.medium.source_url
    })
}


function shuffle_feed(feed) {
  let result = []

  while (feed.length) {
    // Choose next article giving newer articles a higher probability
    let r = Math.random()
    let x = Math.floor(-Math.log(r) / Math.log(3 / 2))
    let i = (r == 0 || feed.length <= x) ? 0 : x

    result.push(feed[i])
    feed.splice(i, 1)
  }

  return result
}


let authors = {}


function get_author(article, post) {
  if (post.author in authors) {
    article.author = authors[post.author]
    return Promise.resolve()
  }

  return fetch(api_base + `/users/${post.author}`)
    .then(r => r.json())
    .then(author => {
      authors[post.author] = author.name
      article.author = author.name
    })
}


export default {
  data() {
    return {
      feed: []
    }
  },


  mounted() {this.update_feed()},


  methods: {
    cache_feed() {util.store('fah-feed', this.feed)},


    update_feed() {
      try {
        this.get_feed()
      } catch (e) {console.log(e)}
      setTimeout(this.update_feed, 60000)
    },


    get_feed() {
      let feed = util.retrieve('fah-feed')
      if (feed) return this.feed = shuffle_feed(feed)

      fetch(api_base + '/posts?context=embed')
        .then(r => r.json())
        .then(posts => {
          let feed = []
          let promises = []

          for (const post of posts) {
            let desc = post.excerpt.rendered
                .replace('>Read more<', 'target="_blank">Read more<')

            let article = reactive({
              url:         post.link,
              title:       post.title.rendered,
              date:        new Date(post.date).toDateString(),
              description: desc
            })
            feed.push(article)

            promises.push(get_featured_image(article, post))
            promises.push(get_author(article, post))
          }

          this.feed = shuffle_feed(feed)

          return Promise.all(promises)
        }).then(this.cache_feed)
    }
  }
}
</script>

<template lang="pug">
.news-feed
  h2 Folding@home News
  h3(v-if="!feed.length") Loading...

  article(v-for="item in feed")
    .content
      a.title(:href="item.url", target="_blank"): h3(v-html="item.title")
      .byline By #[span.author {{item.author}}] on #[span.date {{item.date}}].
      p(v-html="item.description")

    .image
      a(:href="item.url", target="_blank"): img(:src="item.image")
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
    display flex
    gap 1em

    a h3
      color body-fg

      &:hover
        color link-color

    .content
      flex 1

      > .byline
        font-size 80%
        margin-bottom 1em

    > .image
      width 20em
      text-align right

      img
        max-height 10em
        margin 1em 0
</style>
