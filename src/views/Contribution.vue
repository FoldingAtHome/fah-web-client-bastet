<template lang="pug">
.view
  p {{ config.user }}
  p(v-if="response.data")
    | I earned {{ humanFormat(response.data.earned, 2) }} points.
    p Contributed {{ humanFormat(response.data.contributed) }} points from team's total of {{ humanFormat(response.data.team_total) }} points.
</template>

<script>
import { useContributionAPI } from '../composables/useAPI';
import useWebSocket from '../composables/useWebSocket';
export default {
  name: "Contribution",
  setup() {
    const { response, getUserContribution } = useContributionAPI
    const { config } = useWebSocket

    const humanFormat = (num, precision = 1) => {
      if(!num) return 0;
      if(num >= 1e12) return (num / 1e12).toFixed(precision) + 'T';
      if(num >= 1e9)  return (num / 1e9 ).toFixed(precision) + 'B';
      if(num >= 1e6)  return (num / 1e6 ).toFixed(precision) + 'M';
      if(num >= 1e3)  return (num / 1e3 ).toFixed(precision) + 'K';
    }

    getUserContribution(config.value.user, config.value.team);

    return { response, config, humanFormat }
  }
};
</script>
