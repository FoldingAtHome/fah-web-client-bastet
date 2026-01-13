/******************************************************************************\

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

\******************************************************************************/

import {reactive} from 'vue'


class News {
  constructor(ctx, url = 'https://foldingathome.org/wp-json/wp/v2',
              timeout = 24 * 60 * 60 * 1000) {
    this.cache   = ctx.$cache
    this.url     = url
    this.timeout = timeout
    this.data    = reactive({
      authors: {},
      feed:    [],
    })

    this._update()
  }


  get_feed() {return this.data.feed}


  set_feed(feed) {
    feed = feed.slice() // Copy
    let result = []

    while (feed.length) {
      // Choose next article giving newer articles a higher probability
      let r = Math.random()
      let x = Math.floor(-Math.log(r) / Math.log(3 / 2))
      let i = (r == 0 || feed.length <= x) ? 0 : x

      result.push(feed[i])
      feed.splice(i, 1)
    }

    this.data.feed = result
  }


  async get_featured_image(article, post) {
    let url   = `${this.url}/media/${post.featured_media}?context=embed`
    let r     = await fetch(url)
    let media = await r.json()
    let details = media.media_details || {}
    article.image = ((details.sizes || {}).medium || {}).source_url
  }


  async get_author(article, post) {
    if (post.author in this.data.authors) {
      article.author = this.data.authors[post.author]
      return
    }

    let r      = await fetch(`${this.url}/users/${post.author}`)
    let author = await r.json()
    this.data.authors[post.author] = author.name
    article.author = author.name
  }


  async _update() {
    try {
      await this._load_feed()
    } catch (e) {console.log(e)}

    setTimeout(() => this._update(), 60 * 60 * 1000)
  }


  async _load_feed() {
    // Check cache
    let data = await this.cache.get('news', this.timeout)
    if (data) return this.set_feed(data)

    // Download feed
    let r     = await fetch(`${this.url}/posts?context=embed`)
    let posts = await r.json()

    let feed     = []
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

      promises.push(this.get_featured_image(article, post))
      promises.push(this.get_author(article, post))
    }

    if (!feed.length) return
    this.set_feed(feed)

    // Cache results
    await Promise.all(promises)
    await this.cache.set('news', feed)
  }
}

export default News
