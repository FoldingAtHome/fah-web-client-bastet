<script>
import util from './util'


export default {
  name: 'ButtonImpl',
  props: ['name', 'text', 'icon', 'disabled', 'route'],
  emits: ['click'],


  computed: {
    content() {
      return this.text == undefined ? util.capitalize(this.name) : this.text
    }
  },


  methods: {
    click(event) {
      if (this.route) this.$router.push(this.route)
      else this.$emit('click', event)
    }
  }
}
</script>

<template lang="pug">
button(@click="click", :disabled="this.disabled").
  #[.fa(v-if="icon", :class="'fa-' + icon")] {{content}}
</template>
