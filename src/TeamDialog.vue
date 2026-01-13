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
  data() {
    return {
      create: true,
      orig: {},
      team: {}
    }
  },


  computed: {
    buttons() {
      let text = `${this.create ? 'Create' : 'Save'} Team`
      return [{name: 'ok', text, icon: 'plus', disabled: !this.team_valid}]
    },


    modified()   {return !this.$util.isEqual(this.team, this.orig)},
    name_valid() {return /^[^<>;&"'\\`]{2,100}$/.test(this.team.name)},
    url_valid()  {return /^[^<>;'"`{}^\\[\]\|]*$/.test(this.team.url)},
    logo_valid() {return this.$refs.logo.valid},


    team_valid() {
      return this.modified && this.name_valid && this.url_valid &&
        this.logo_valid
    }
  },


  methods: {
    async exec(team, create) {
      this.orig   = Object.assign({}, team)
      team.logo   = team.logo || 'https://foldingathome.org/logo.png'
      this.team   = team
      this.create = create
      let r = await this.$refs.dialog.exec()
      this.fix_url()
      return r
    },


    fix_url() {
      if (this.team.url && this.team.url.indexOf('://') == -1)
        this.team.url = 'https://' + this.team.url
    }
  }
}
</script>

<template lang="pug">
Dialog.team-dialog(:buttons="buttons", ref="dialog")
  template(v-slot:header) {{create ? 'Create' : 'Edit'}} Team
  template(v-slot:body)
    fieldset.settings
      .setting
        HelpBalloon(name="Name")
          p Choose a display name for your Folding@home team.
          p.
            The name may contain any characters other than #[tt &lt;],
            #[tt &gt;], #[tt &#59;], or #[tt &amp;] and must be between 2 and
            100 characters in length.
        input(v-model="team.name", :class="{error: !name_valid}")

      .setting
        HelpBalloon(name="URL")
          p.
            Optionally set a URL for your team.  This could be your team's
            Facebook or other home page.
          p It must be a valid URL or empty.

        input(v-model="team.url", :class="{error: !url_valid}",
          @change="fix_url")

      .setting
        HelpBalloon(name="Logo")
          p Optionally set your team's logo.
          p.
            The ideal logo is 128x128 pixels.
            If you choose a larger image, it will be automatically scaled down.
            Your logo's final size must not be less than 32 pixels in either
            dimension.

        image-input(v-model="team.logo", :width="128", :height="128",
          :min-width="32", :min-height="32", ref="logo")
</template>

<style lang="stylus">
.team-dialog
  fieldset.settings
    border none
 </style>
