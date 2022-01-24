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
      .col-sm-4(v-show="connectedUrls.length > 1")
        select.form-select(v-model="current_url" aria-label="Select URL")
          option(v-for="conn in connectedUrls" :key="conn" :value="conn") {{ conn }}
</template>

<script>
import useWebSocket from '../composables/useWebSocket'

export default {
  name: 'Navbar',
  setup() {
    const { current_url, connectedUrls } = useWebSocket

    return { current_url, connectedUrls }
  }
}
</script>
