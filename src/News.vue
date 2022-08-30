<script>
import {reactive} from 'vue'
import Cookie from './cookie.js'


const api_base = 'https://foldingathome.org/wp-json/wp/v2'
const feed_timeout = 24 * 60 * 60 * 1000


function get_featured_image(article, post) {
  return fetch(api_base + `/media/${post.featured_media}?context=embed`)
    .then(r => r.json())
    .then(media => {
      article.image = media.media_details.sizes.medium.source_url
    })
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
    cache_feed() {
      localStorage.setItem('fah-feed', JSON.stringify(this.feed))
      localStorage.setItem('fah-feed-ts', new Date().toISOString())
    },


    update_feed() {
      try {
        this.get_feed()
      } catch (e) {console.log(e)}
      setTimeout(this.update_feed, 60000)
    },


    get_feed() {
      let feed = localStorage.getItem('fah-feed')
      let ts   = localStorage.getItem('fah-feed-ts')
      if (ts != null && feed != null)
        try {
          if (Date.now() - new Date(ts).getTime() < feed_timeout) {
            if (!this.feed.length) this.feed = JSON.parse(feed)
            return
          }
        } catch (e) {}

      fetch(api_base + '/posts?context=embed')
        .then(r => r.json())
        .then(posts => {
          this.feed = []
          let promises = []

          for (const post of posts) {
            let article = reactive({
              url:         post.link,
              title:       post.title.rendered,
              date:        new Date(post.date).toDateString(),
              description: post.excerpt.rendered
            })
            this.feed.push(article)

            promises.push(get_featured_image(article, post))
            promises.push(get_author(article, post))
          }

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
  > h2, > h3
    text-align center

  article
    background panel-bg
    border 1px solid border-color
    border-radius 4px
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
