<!--

                  This file is part of the Folding@home Client.

          The fah-client runs Folding@home protein folding simulations.
                    Copyright (c) 2001-2024, foldingathome.org
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
  props: ['mach'],


  data() {
    return {
      name: this.mach.get_name()
    }
  },


  computed: {
    linked()   {return this.mach.is_linked()},
    valid()    {return /^[\w\.-]{1,64}$/.test(this.name)},
    modified() {return this.name != this.mach.get_name()},
  },


  methods: {
    async save() {return this.mach.save_name(this.name)},


    async link() {
      this.mach.set_name(this.name)
      this.mach.link(this.$adata.token)
    },


    async unlink() {
      await this.mach.unlink()
      await this.$account.update()
    }
  }
}
</script>

<template lang="pug">
.setting
  label(:title="'F@H ID ' + mach.get_id()") Name
  input(v-model="name", pattern="[\\w\\.-]{1,64}")

  .setting-actions
    Button.button-icon(v-if="linked", @click="save", icon="save",
      :disabled="!valid || !modified", title="Save machine name")

    Button.button-icon(v-if="linked", @click="unlink",
      icon="unlink", title="Unlink machine from this account")

    Button.button-icon(v-if="!linked", @click="link", icon="link",
      :disabled="!valid", title="Link machine to this account")
</template>

<style lang="stylus">
</style>
