<script>
export default {
  data() {
    return {
      pause_dialog_buttons: [
        {name: 'pause', text: 'Pause now', icon: 'pause'},
        {name: 'finish', text: 'Finish up, then pause', icon: 'clock-o'}
      ]
    }
  },


  methods: {
    open(cb) {this.$refs.dialog.open(cb)}
  }
}
</script>

<template lang="pug">
Dialog(:buttons="pause_dialog_buttons", ref="dialog")
  template(v-slot:header) Pause or Finish
  template(v-slot:body).
    Would you like to pause folding now or finish all the active work units
    then pause?
</template>

<style lang="stylus">
</style>
