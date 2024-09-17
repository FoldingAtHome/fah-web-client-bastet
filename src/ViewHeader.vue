<!--

                  This file is part of the Folding@home Client.

          The fah-client runs Folding@home protein folding simulations.
                    Copyright (c) 2001-2024, foldingathome.org
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
  name: 'ViewHeader',
  props: ['title', 'subtitle'],


  computed: {
    team()      {return this.$stats.get_team()},
  },


  methods: {
    close() {this.$router.back()},


    async confirm_team_url(url) {
      if (!url) return
      let response = await this.$root.message(
        'confirm', 'Visit team website?',
        `<p>You are about to visit your team's website.  Folding@home cannot ` +
        `vouch for the safety of this website.  Proceed at your own risk.</p>`,
        [
          {name: 'cancel', icon: 'times'},
          {name: 'ok', icon: 'check', text: 'Proceed', success: true},
        ])

      if (response == 'ok') window.open(url, '_blank')
    }
  }
}
</script>

<template lang="pug">
.view-header
  .header-top
    component.active-team(v-if="team.team", :is="team.url ? 'a' : 'div'",
      :href="team.url", target="_blank",
      :title="team.url ? `Visit your team's home page.` : ''",
      @click.prevent="confirm_team_url(team.url)")
      img.team-logo(:src="team.logo")
      .team-name.header-title {{team.name}}

    FAHLogo(v-else)

    .header-center
      slot(name="center")
        .header-title(v-if="title") {{title}}
        .header-subtitle(v-if="subtitle") {{subtitle}}

    .header-actions
      slot(name="actions")
        Button(text="Close", icon="times", @click="close")

  .header-menu
    slot(name="menu")
</template>

<style lang="stylus">
.page-view .view-header
  display flex
  flex-direction column
  color var(--header-fg)
  background var(--header-bg)
  border var(--border)
  border-radius var(--border-radius)
  overflow hidden

  .header-top
    display flex
    justify-content space-between
    align-items center
    gap var(--gap)
    padding var(--gap) calc(var(--gap) * 1.5)

    a:hover
      text-decoration none

    > *
      width 33%

    .active-team
      display flex
      align-items center
      gap calc(var(--gap) / 2)
      flex-wrap wrap

      .team-logo
        max-height 48px

      .team-name
        white-space nowrap

    .header-center
      display flex
      flex-direction column
      gap var(--gap)
      justify-content center

    .header-actions
      align-items end
      display flex
      flex-direction row
      justify-content right
      gap var(--gap)

      .button-icon
        width 1.25em
        font-size 130%

        &:not(:hover)
          &:not(.button-disabled)
            color var(--header-fg)

        &:hover
          &:not(.button-disabled)
            color var(--link-color)

@media (max-width 800px)
  .page-view .view-header
    .header-top .active-team .team-logo
      max-height 32px

    .control .button-content
      display none
</style>
