<!--

                  This file is part of the Folding@home Client.

          The fah-client runs Folding@home protein folding simulations.
                    Copyright (c) 2001-2023, foldingathome.org
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
  props: ['config'],


  data() {
    return {
      show_key: false,
      causes:   this.$api.get_causes(),
    }
  }
}
</script>

<template lang="pug">
HelpBalloon(name="Username").
  Choose a display name for your Folding@home account.  This name
  does not have to be unique.  It may contain any characters other
  than #[tt &lt;], #[tt &gt;], #[tt &#59;], or #[tt &amp;] and must be
  between 2 and 100 characters in length.  If you wish to remain
  anonymous enter #[tt Anonymous].

input(v-model="config.user")
div

HelpBalloon(name="Team")
  | You may wish to join a Folding@home team.  If you do not already have
  | a team you can create a new one. Enter #[tt 0] for no team.
  Button(text="Create a Team", icon="plus",
    href="https://apps.foldingathome.org/team")

input(v-model.number="config.team", type="number")
div

HelpBalloon(name="Passkey")
  | A passkey allows you to collect bonus points.  Enter a passkey if you
  | have one.  You may leave this field blank.  Click the button to obtain
  | a passkey.
  Button(text="Get a Passkey", icon="key",
    href="https://apps.foldingathome.org/getpasskey")


input(v-model="config.passkey", pattern="[\\da-fA-F]{31,32}",
  :class="{password: !show_key}")

div
  Button.button-icon(:icon="'eye' + (show_key ? '' : '-slash')",
    @click="show_key = !show_key",
    :title="(show_key ? 'Hide' : 'Show') + ' passkey'")

HelpBalloon(name="Cause").
  You may choose a prefered cause to support.  Folding@home will try to
  assign you more work supporting your prefered cause.

select(v-model="config.cause")
  option(v-for="name in causes", :value="name") {{name}}
div
</template>

<style lang="stylus">
</style>
