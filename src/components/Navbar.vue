<template>
    <div>
        <nav class="navbar navbar-expand-md navbar-dark bg-dark">
            <a class="navbar-brand" href="#">
              <img src="../assets/fahlogo2.png" width="170" height="70" class="d-inline-block align-top" alt="">
            </a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"
                    aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
              <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
              <ul class="navbar-nav">
                <li class="nav-item active">
                  <router-link class="nav-link" :to="{ name : 'Home' }">Home</router-link>
                </li>
                <li class="nav-item">
                  <router-link class="nav-link" :to="{ name : 'Config' }">Configuration</router-link>
                </li>
                <li class="nav-item">
                  <router-link class="nav-link" :to="{ name : 'Todo' }">Feature2</router-link>
                </li>
                <li class="nav-item">
                  <router-link class="nav-link" :to="{ name : 'Todo' }">Feature3</router-link>
                </li>
              </ul>
            </div>
        </nav>
    </div>
</template>

<script>
export default {
  name: 'Navbar'
}
</script>
