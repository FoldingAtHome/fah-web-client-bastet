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
          router-link.nav-link(:to="{ name : 'Visualize' }")
            | Visualization
        li.nav-item
          router-link.nav-link(:to="{ name : 'Todo' }")
            | Feature3
</template>

<script>
export default {
  name: 'Navbar'
}
</script>
