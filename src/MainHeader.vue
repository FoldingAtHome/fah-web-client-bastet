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
import MainMenu   from './MainMenu.vue'
import TickerView from './TickerView.vue'


export default {
  name: 'MainHeader',
  components: {MainMenu, TickerView},
}
</script>

<template lang="pug">
ViewHeader.main-header
  template(v-slot:center): slot(name="center")

  template(v-slot:actions)
    Button.button-image(v-if="$adata.avatar", route="/account/",
      :image="$adata.avatar",
      :title="$adata.user + ': Account Settings and Logout'")

    Button.button-icon(v-else-if="$account.logged_in", route="/account/",
      icon="user", :title="$adata.user + ': Account Settings and Logout'")

    Button(v-else, text="Login", icon="sign-in", @click="$root.login()",
      title="Login to Folding@home or register a new account")

  template(v-slot:menu)
    MainMenu

TickerView(v-if="false")
</template>

<style lang="stylus">
.page-view .main-header
  .header-top .header-center
    flex-direction row
</style>
