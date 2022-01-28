<template lang="pug">
div
  nav.navbar.fixed-top.navbar-expand-md.navbar-dark.bg-dark
    a.navbar-brand(href="#")
      img.d-inline-block.align-top(src="../assets/fahlogo2.png" width="170" height="70" alt)
    button.navbar-toggler(type="button", data-bs-toggle="collapse", data-bs-target="#navbarNav",
                          aria-controls="navbarNav", aria-expanded="false" aria-label="Toggle navigation")
      span.navbar-toggler-icon
    #navbarNav.collapse.navbar-collapse
      ul.navbar-nav
        li.nav-item.active
          router-link.nav-link(:to="{ name : 'Home' }")
            | Home
        li.nav-item
          router-link.nav-link(:to="{ name : 'Config' }")
            | Configuration
        li.nav-item
          router-link.nav-link(:to="{ name : 'WorkUnit' }")
            | Visualization
        li.nav-item
          router-link.nav-link(:to="{ name: 'Peers' }")
            | Peers
      .col-sm-4(v-show="showUrlSelection")
        select.form-select(v-model="current_url" aria-label="Select URL")
          option(v-for="url in connectedUrls" :key="url" :value="url") {{ getIP(url) }}
</template>

<script>
import useWebSocket from '../composables/useWebSocket'
import { computed } from 'vue';

export default {
  name: 'Navbar',
  setup() {
    const { getIP, localhost, current_url, connectedUrls } = useWebSocket

    const showUrlSelection = computed(() => {
      return connectedUrls.value.length >= 1
        && connectedUrls.value.indexOf(getIP(localhost)) === -1
    })

    return { getIP, current_url, connectedUrls, showUrlSelection }
  }
}
</script>
