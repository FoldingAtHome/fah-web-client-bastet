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
  name: 'Award',


  props: {
    title:    String,
    wus:      Boolean,
    team:     Number,
    user:     Number,
    disabled: Boolean,
  },


  data() {return {active: false, loaded: false}},


  computed: {
    url() {
      let props = []

      if (this.user) props.push('user=' + this.user)
      if (this.team) props.push('team=' + this.team)
      if (this.wus)  props.push('type=wus')

      return 'https://apps.foldingathome.org/awards?' + props.join('&')
    }
  },


  methods: {
    async open() {
      this.active = true
      try {
        await this.$refs.dialog.exec()
      } finally {
        this.active = false
      }
    }
  }
}
</script>

<template lang="pug">
.award
  Button(@click="open()", icon="trophy", :text="title", :disabled="disabled")

  Dialog.award-dialog(ref="dialog", :buttons="[]", :header="title",
    width="auto", allowClickAway)
    template(v-slot:body)
      h2(v-if="!loaded") Loading...
      a(:href="url"): img(v-if="active", :src="url", @load="loaded = true")
</template>

<style lang="stylus">
.dialog-overlay .award-dialog
  .dialog-body
    padding 0

    h2
      padding var(--gap)
      text-align center

    img
      max-width 100vw
      max-height 100vh
      display block

  .dialog-footer
    display none
</style>
