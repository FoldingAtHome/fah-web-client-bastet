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
  computed: {projects() {return this.$projects.get()}}
}
</script>

<template lang="pug">
.projects-view.page-view
  MainHeader

  .view-body
    h2(v-if="$projects.is_loading() && !this.projects.length") Loading...

    template(v-else-if="!projects.length")
      p No active projects.
      p While you are folding active projects will display here.

    ProjectView(v-for="project in projects", :project="project")
</template>

<style lang="stylus">
.projects-view .view-body
  display flex
  flex-direction column
  gap var(--gap)

  .project
    width 100%
</style>
