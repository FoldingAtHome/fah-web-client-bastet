<script>


export default {
  data() {
    return {
      location: ''
    }
  },


  created() {
    document.getElementsByTagName('body')[0].onkeyup = ev => {
      if (ev.keyCode == 76 && ev.ctrlKey && ev.shiftKey)
        this.open()
    }
  },


  methods: {
    accept() {this.$refs.dialog.close('Ok')},


    open(cb) {
      const host = localStorage.getItem('client-host') || '127.0.0.1'
      const port = localStorage.getItem('client-port') || 7396
      this.location = host + ':' + port

      this.$refs.dialog.open(result => {
        if (result == 'Ok') {
          let parts = this.location.split(':')

          if (parts[0]) localStorage.setItem('client-host', parts[0])
          else localStorage.removeItem('client-host')
          if (parts[1]) localStorage.setItem('client-port', parts[1])
          else localStorage.removeItem('client-port')

          location.reload()
        }
      })
    }
  }
}
</script>

<template lang="pug">
Dialog(ref="dialog", :zIndex="2000")
  template(v-slot:header) Set Client Location
  template(v-slot:body)
    .location-dialog-body
      label Location
      input(v-model="location", @keyup.enter="accept")
</template>

<style lang="stylus">
  .location-dialog-body
    display flex
    gap 0.25em
</style>
