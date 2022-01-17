<template lang="pug">
.view
  h2 Peers
  form
    .col-md-9.col-lg-8.form-data
      textarea#peers.form-control(rows="3" cols="25" v-model="cachedPeers"
        placeholder=`Enter comma separated urls with port numbers. Eg.
                    https://192.168.0.2:3000,https://192.168.0.3:3001`)
    .col-md-2.col-lg-2.form-data
      button.settings.btn.btn-warning(type="button" @click="reset") Discard
      button.settings.btn.btn-primary(type="button" @click="save") Save
  table.table
    thead
      tr
        th(width="10%")
          | Status
        th(width="50%")
          | Url
        th(width="20%")
          | CPUs
        th(width="20%")
          | GPUs
    tbody
      template(v-for="(peer, index) in getPeers" :key="index")
        tr
          td Hello
          td {{ peer }}
          td Hello
          td Hello
</template>

<script>
import { ref } from 'vue';

export default {
  name: "Peers",
  setup() {
    console.log("peers" + JSON.parse(JSON.stringify(window.localStorage.getItem("peers"))));
    const cachedPeers = ref(window.localStorage.getItem("peers"));
    const reset = () => {
      cachedPeers = window.localStorage.getItem("peers");
    };

    const save = () => {
      console.log("Save Peers.");
      window.localStorage.setItem("peers", cachedPeers);
    };

    const getPeers = () => {
      return window.localStorage.getItem("peers").split(",");
    }

    return { cachedPeers, reset, save, getPeers };
  }
}

</script>

<style lang="stylus" scoped>
form
  text-align: center

button.settings
  margin: 10px
</style>
