<script>
import util from './util.js'


export default {
  name: 'Dialog',
  emits: ['close'],

  props: {
    buttons: {
      default(rawProps) {
        return [{
          name: 'Ok',
          icon: 'check'
        }, {
          name: 'Cancel',
          icon: 'times'
        }]
      }
    },

    zIndex: {type: Number, default: 100}
  },


  data() {
    return {
      active: false
    }
  },


  methods: {
    open(resolve)  {
      util.lock_scrolling()
      this.active = true
      this.resolve = resolve
    },


    close(result) {
      util.unlock_scrolling()
      this.active = false

      if (result) this.$emit('close', result)
      if (this.resolve) this.resolve(result)
      this.resolve = undefined
    }
  }
}
</script>

<template lang="pug">
Teleport(to="body")
  .dialog-overlay(v-if="active", :style="{'z-index': zIndex}")
    .dialog(@click.prevent.stop="true")
      .dialog-header
        slot(name="header")

      .dialog-body
        slot(name="body")

      .dialog-footer
        Button(v-for="b in buttons", @click="close(b.name)", v-bind="b")
</template>

<style lang="stylus">
@import('./colors.styl')

.dialog-overlay
  position absolute
  top 0
  left 0
  width 100vw
  height 100vh
  background overlay-bg

  .dialog
    width 30em
    margin 16% auto
    min-height 10em
    background panel-bg
    box-shadow 3px 3px 12px #222

    > *
      padding 1em

    .dialog-header
      background header-bg
      color header-fg
      border-bottom 1px solid border-color

    .dialog-footer
      display flex
      justify-content right
      gap 1em

      button
        margin 0
</style>
