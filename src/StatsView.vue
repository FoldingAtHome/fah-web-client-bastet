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
    stats()      {return this.$stats.get_data()},
    team()       {return this.$stats.get_team()},
    is_anon()    {return this.$stats.is_anon()},
    uid()        {return this.stats.id},


    team_owner() {
      for (let team of this.$adata.teams || [])
        if (team.team == this.team.team) return true
      return false
    }
  },


  methods: {
    top(rank) {
      rank = rank == undefined ? 1000001 : rank

      for (let i = 2; i < 7; i++) {
        let level = Math.pow(10, i)
        if (rank <= level) return this.$util.human_number(level, 0)
      }
    },


    tpercent(user, team) {
      if (!team) return '0.0%'
      return (user / team * 100).toFixed(1) + '%'
    }
  }
}
</script>

<template lang="pug">
.stats-view.page-view
  MainHeader

  .view-body(v-if="stats")
    .view-panel(v-if="stats.name")
      .user-header
        .user-avatar.fa.fa-user-o
        .user-name(:title="stats.name")
          a(v-if="stats.id", :href="$stats.url + '/donor/id/' + stats.id",
            target="_blank") {{stats.name}}
          span(v-else-if="stats.name") {{stats.name}}
          span(v-else) Anonymous

        .user-rank(v-if="stats.rank") Rank {{stats.rank.toLocaleString()}}

      .user-top(v-if="top(stats.rank)") Top {{top(stats.rank)}} Ranked Donor
      .user-top(v-else) Unranked Ranked Donor

      .user-points {{stats.score.toLocaleString()}} points earned
      .user-wus {{stats.wus.toLocaleString()}} WUs completed

      h2 Active Clients
      .active-7 {{stats.active_7}} active clients within 7 days
      .active-50 {{stats.active_50}} active clients within 50 days

      h2 Awards
      .user-awards
        Award.user-wus-award(
          title="WUs Award", :user="uid", wus, :disabled="!stats.wus")
        Award.user-points-award(title="Points Award", :user="uid",
          :disabled="!stats.wus")

    .view-panel.no-info(v-else) Folding anonymously

    .view-panel(v-if="team.team")
      .team-header
        img.team-logo(v-if="team.logo", :src="team.logo")
        .team-logo.fa.fa-users(v-else)
        .team-name(:title="team.name")
          a(:href="$stats.url + '/team/' + team.team", target="_blank")
            | {{team.name}}
          Button.button-icon(v-if="team_owner", icon="pencil",
            title="Edit team settings.", route="/account/teams")
        .team-rank(v-if="team.trank") Rank {{team.trank.toLocaleString()}}

      .team-top(v-if="top(team.trank)") Top {{top(team.trank)}} Ranked Team
      .team-top(v-else) Unranked Team

      .team-points {{team.tscore.toLocaleString()}} points earned
      .team-wus {{team.twus.toLocaleString()}} WUs completed

      h2 Your Contribution
      .contrib-points.
        {{team.score.toLocaleString()}} points
        ({{tpercent(team.score, team.tscore)}})

      .contrib-wus.
        {{team.wus.toLocaleString()}} WUs ({{tpercent(team.wus, team.twus)}})

      h2 Awards
      .team-awards
        Award.team-wus-award(
        title="WUs Award", :team="team.team", wus, :disabled="!team.twus")
        Award.team-points-award(title="Points Award", :team="team.team",
         :disabled="!team.tscore")

    .view-panel.no-info(v-else) No team selected
</template>

<style lang="stylus">
.stats-view
  .view-body
    flex-direction row
    flex-wrap wrap
    justify-content center

    > *
      flex 1
      max-width calc(50% - var(--gap) / 2)
      display flex
      flex-direction column
      gap calc(var(--gap) / 2)

    .user-header, .team-header
      display flex
      gap var(--gap)
      flex-direction row
      align-items center

      > *
        white-space nowrap

      .user-rank, .team-rank
        flex 1
        text-align right

    .user-name, .team-name
      display flex
      gap calc(var(--gap) / 2)
      font-size 150%
      width 18em
      overflow hidden
      text-overflow ellipsis

      .fa
        font-size 75%

    .user-avatar, .team-logo
      display flex
      justify-content center
      align-items center
      height 48px
      min-width 48px
      max-width 128px
      font-size 40px

    .user-top, .team-top
      padding var(--gap)
      margin var(--gap) calc(var(--gap) * -1.2) var(--gap) \
        calc(var(--gap) * -1.5)
      white-space nowrap
      background var(--success-color)
      color #fff

  .user-awards, .team-awards
    display flex
    gap var(--gap)

  .no-info
    display flex
    align-items center
    justify-content center
    font-size 140%

@media (max-width 60em)
  .stats-view .view-body > *
    max-width 100vw
</style>
