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
  name: 'StatsView',


  computed: {
    stats()     {return this.$stats.get_data()},
    team()      {return this.$stats.get_team()},
    is_anon()   {return this.$stats.is_anon()},
    uid()       {return this.stats.id},
  },


  methods: {
    top(rank) {
      rank = rank == undefined ? 1000001 : rank

      for (let i = 2; i < 7; i++) {
        let level = Math.pow(10, i)
        if (rank <= level) return this.$util.human_number(level, 0)
      }
    }
  }
}
</script>

<template lang="pug">
.stats-view.page-view
  MainHeader

  .view-body
    .view-panel(v-if="stats.id")
      .user-header
        .user-avatar.fa.fa-user-o
        .user-name(v-if="stats.name")
          a(v-if="stats.name", :href="$stats.url + '/donor/id/' + stats.id",
            target="_blank") {{stats.name}}
          span(v-else) Anonymous

        .user-rank Rank {{stats.rank.toLocaleString() || 'unranked'}}

      .user-top(v-if="top(stats.rank)") Top {{top(stats.rank)}} Ranked Donor

      .user-points {{stats.score.toLocaleString()}} points earned
      .user-wus {{stats.wus.toLocaleString()}} WUs completed

      h2 Active Clients
      .active-7 {{stats.active_7}} active clients within 7 days
      .active-50 {{stats.active_50}} active clients within 50 days

      h2 Awards
      .user-awards
        Award.user-wus-award(title="WUs Award", :user="uid", wus)
        Award.user-points-award(title="Points Award", :user="uid")

    .view-panel.no-info(v-else) Folding anonymously

    .view-panel(v-if="team.team")
      .team-header
        a(:href="team.url", target="_blank")
          img.team-logo(v-if="team.logo", :src="team.logo")
          .team-logo.fa.fa-users(v-else)
        .team-name
          a(:href="$stats.url + '/team/' + team.team", target="_blank")
            | {{team.name}}
        .team-rank Rank {{team.trank.toLocaleString() || 'unranked'}}

      .team-top(v-if="top(team.trank)") Top {{top(team.trank)}} Ranked Team

      .team-points {{team.tscore.toLocaleString()}} points earned
      .team-wus {{team.twus.toLocaleString()}} WUs completed

      h2 Your Contribution
      .contrib-points.
        {{team.score.toLocaleString()}} points
        ({{(team.score / team.tscore * 100).toFixed(1)}}%)

      .contrib-wus.
        {{team.wus.toLocaleString()}} WUs
        ({{(team.wus / team.twus * 100).toFixed(1)}}%)

      h2 Awards
      .team-awards
        Award.team-wus-award(title="WUs Award", :team="team.team", wus)
        Award.team-points-award(title="Points Award", :team="team.team")

    .view-panel.no-info(v-else) No team selected
</template>

<style lang="stylus">
.stats-view
  .view-body
    display flex
    gap 1em
    flex-wrap wrap

    > *
      flex 1
      max-width 29.5em

    .user-header, .team-header
      display flex
      padding 0.5em
      gap 1em
      flex-direction row
      align-items center

      > *
        white-space nowrap

      .user-rank, .team-rank
        flex 1
        text-align right

    .user-name, .team-name
      font-size 150%

    .user-avatar, .team-logo
      display flex
      justify-content center
      align-items center
      height 48px
      min-width 48px
      max-width 128px
      font-size 40px

    .user-top, .team-top
      padding 0.125em 1.25em
      margin 0 calc(-1em - 1px) 1em -1.3em
      white-space nowrap
      background var(--success-color)
      box-shadow -3px 3px 8px rgba(0, 0, 0, 0.25)
      color #fff

  .user-awards, .team-awards
    display flex
    gap 0.5em

  .no-info
    display flex
    align-items center
    justify-content center
    font-size 140%

@media (max-width 60em)
  .stats-view .view-body > *
    max-width 100vw

@media (max-width 800px)
  .stats-view
    .view-body
      .user-top, .team-top
        margin 0.5em -0.75em
</style>
