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
import ChartsView from './ChartsView.vue'


export default {
  name: 'ViewHeader',
  props: ['title', 'subtitle'],
  components: {ChartsView},


  computed: {
    team() {return this.$stats.get_team()},

    chart_config() {
      return {
        labels:  {enabled: false},
        marker:  {enabled: false},
        offsets: {left: 0, right: 0, top: 0, bottom: 0},
        grid:    {opacity: 0.4},
      }
    }
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
    },


    on_chart_activate() {this.$root.open_team_chart()},
  }
}
</script>

<template lang="pug">
.view-header
  .header-top
    template(v-if="team.team")
      component.active-team(:class="{'active-team-link': !!team.url}",
        :is="team.url ? 'a' : 'div'", target="_blank", :href="team.url",
        :title="team.url ? `Visit your team's home page.` : ''",
        @click.prevent="confirm_team_url(team.url)")
        img.team-logo(:src="team.logo")
        .team-name.header-title {{team.name}}

      charts-view(v-if="!title", ref="chart", :charts="$stats.charts",
        :config="chart_config", @activate="on_chart_activate",
        :mode="$root.chart_mode", :source="$root.chart_source")

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

    .active-team-link, .charts-view
      border 1px solid rgba(0, 0, 0, 0)
      border-radius var(--border-radius)

      &:hover
        border 1px solid var(--link-color)

    .active-team
      display flex
      align-items center
      gap calc(var(--gap) / 2)
      flex-wrap wrap

      .team-logo
        max-height 48px

      .team-name
        white-space nowrap

    .charts-view
      height 50px

      .chart-coords
        display none

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
