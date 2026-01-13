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

function get_icon(type) {
  switch (type) {
  case 'error':   return 'exclamation-circle'
  case 'warn':    return 'exclamation-triangle'
  case 'info':    return 'info-circle'
  case 'confirm': return 'question-circle'
  }
}


export default {
  data() {
    return {
      title:   '',
      body:    '',
      icon:    '',
      buttons: []
    }
  },


  methods: {
    async exec(type, title, body, buttons) {
      if (this.$refs.dialog.active) {
        let multiple = 'Multiple messages'
        if (this.title != multiple) {
          this.body = '<h2>' + this.title + '</h2><p>' + this.body + '</p>'
          this.title = multiple
        }

        this.body += '<h2>' + title + '</h2><p>' + body + '</p>'
        return
      }

      this.title = title
      this.body  = body
      this.icon  = get_icon(type)

      if (buttons) this.buttons = buttons
      else {
        this.buttons = [{name: 'ok', icon: 'check'}]

        switch (type) {
        case 'confirm':
          this.buttons = [
            {name: 'ok',     icon: 'check'},
            {name: 'cancel', icon: 'times'}
          ]
          break
        }
      }

      return this.$refs.dialog.exec()
    }
  }
}
</script>

<template lang="pug">
Dialog.message-dialog(:buttons="buttons", ref="dialog", :allowCancel="false")
  template(v-slot:header)
    .fa(v-if="icon", :class="'fa-' + icon")
    span(v-html="title")

  template(v-slot:body): div(v-html="body")
</template>

<style lang="stylus">
.message-dialog
  .dialog-header-slot
    display flex
    gap var(--gap)
</style>
