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
import util from './util.js'


export default {
  name: 'ClientVersion',
  props: ['client', 'latest'],

  computed: {
    connected() {return this.client.state.connected},
    version()   {return this.client.version()},
    outdated()  {return this.client.outdated(this.latest)}
  }
}
</script>

<template lang="pug">
.client-version(v-if="connected")
  a.outdated(v-if="outdated", :href="$root.util.download_url", target="_blank",
    title="Client version outdated.  Click to open download page.")
      | #[.fa.fa-exclamation-triangle] v{{version}}
      |
      | #[.fa.fa-exclamation-triangle]

  span(v-else, :title="'Folding@home client version ' + version + '.'")
    | v{{version}}
</template>

<style lang="stylus">
@import('colors.styl')

.client-version
  .outdated
    text-decoration none

    &:not(:hover)
      color warn-color

    .fa
      font-size 10pt
</style>
