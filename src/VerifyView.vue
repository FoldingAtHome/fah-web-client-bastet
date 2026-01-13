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
export default {
  props: ['token'],
  data() {return {success: false, failed: false}},


  async mounted() {
    try {
      await this.$api.get('/verify/' + this.token)
      this.success = true

    } catch (e) {
      this.failed = true
      console.debug(e)
    }
  }
}
</script>

<template lang="pug">
.verify-view.page-view
  ViewHeader(title="Verifying Account Email")
    template(v-slot:actions)
      Button(icon="sign-in", text="Login", success,
        @click="$root.login()", title="Login to your Folding@home account",
        :disabled="!success && !failed")

  .view-body
    div(v-if="!success && !failed")
      p Verifying...

    div(v-if="success")
      p Email verification successful.

    div(v-if="failed")
      p Email verification failed.
      p.
        A verification token can be used only once.  If you've already
        verified your email address, please try to login.

</template>

<style lang="stylus">
  .verify-view .view-body
    padding var(--gap)
</style>
