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
import ProjectView from './ProjectView.vue'
import util from './util.js'

const store_key = 'fah-v3-project-'


export default {
  props: ['ids'],
  components: {ProjectView},


  data() {
    return {
      loading: {},
      projects: {},
    }
  },


  watch: {
    ids() {this.update_all()}
  },


  mounted() {this.update_all()},


  methods: {
    update_all() {
      for (let id of this.ids)
        this.update(id)
    },


    update(id) {
      if (this.projects[id] || this.loading[id]) return

      let p = util.retrieve(store_key + id)
      if (p && p.id == id) return this.projects[id] = p

      this.loading[id] = true
      fetch(util.api_url + '/project/' + id)
        .then(r => r.json())
        .then(data => {
          if (!data.error) {
            data.id = parseInt(id)
            this.projects[id] = data
            util.store(store_key + id, data)
          }

        }).finally(() => {
          this.loading[id] = false
        })
    }
  }
}
</script>

<template lang="pug">
.projects(v-if="Object.keys(projects).length")
  h2 Projects
  ProjectView(v-for="project in projects", :project="project")
</template>

<style lang="stylus">
</style>
