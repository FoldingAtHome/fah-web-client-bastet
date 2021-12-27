<template lang="pug">
.card.alert-info
  .row.no-gutters.mt-2(v-if="Object.keys(response.data).length")
    .col-md-2
      i.fas.fa-user-circle.fa-5x.center
    .col-md-2
      .card-text I am folding as:
      h4.card-title {{ config.user }}
      h5.card-title Team {{ config.team }}
    .col-md-8
      .row
        .col-md-6
          .card-text Points earned:
          h2.card-title {{ getEarnedPoints(response.data.earned) }}
        .col-md-6
          .card-text Points per day:
          h2.card-title {{ (props.ppd).toLocaleString('en') }}
      .row
        .card-text.
          Contributed {{ humanFormat(response.data.contributed) }} points to {{ response.data.team_name }}'s total of
          {{ humanFormat(response.data.team_total) }} points.
</template>

<script>
import { useContributionAPI } from '../composables/useAPI';
import useWebSocket from '../composables/useWebSocket';

export default {
  name: 'UserCard',
  props: {
    ppd : {
      default: 0,
      type: Number
    }
  },
  setup(props) {
    const { response, getUserContribution } = useContributionAPI
    const { config } = useWebSocket

    const humanFormat = (num, precision = 2) => {
      if(!num) return 0;
      if(num >= 1e12) return (num / 1e12).toFixed(precision) + 'T';
      if(num >= 1e9)  return (num / 1e9 ).toFixed(precision) + 'B';
      if(num >= 1e6)  return (num / 1e6 ).toFixed(precision) + 'M';
      if(num >= 1e3)  return (num / 1e3 ).toFixed(precision) + 'K';
      return num;
    }

    const getEarnedPoints = (points) => {
      if(points <= 1e9) return points.toLocaleString('en');
      return humanFormat(points);
    }

    getUserContribution(config.value.user, config.value.team);

    return { props, response, config, humanFormat, getEarnedPoints }
  }
}
</script>

<style lang="stylus" scoped>
.card-title
  font-weight bold

.center
  display: block
  margin: auto
</style>