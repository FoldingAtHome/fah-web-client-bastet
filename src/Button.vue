<script>
import ButtonImpl from './ButtonImpl.vue'


export default {
  name: 'Button',
  props: ['name', 'text', 'icon', 'disabled', 'href', 'route'],
  emits: ['click'],
  components: {ButtonImpl}
}
</script>

<template lang="pug">
a(v-if="href", :href="href", target="_blank")
  ButtonImpl(v-bind="$props")

ButtonImpl(v-else, v-bind="$props", @click="$emit('click', event)")
</template>

<style lang="stylus">
@import('colors.styl')

button
  cursor pointer
  margin 0.5em 0
  font-weight bold
  padding 0.75em 1.5em
  border 0
  color button-fg
  background button-bg
  white-space nowrap

  &.button-success
    background button-success

  &:hover
    background link-color

  &.button-icon
    padding 0
    background transparent
    color black
    font-size 110%

    &:hover
      color link-color

button[disabled]
  color button-disabled-fg
  background button-disabled-bg
  cursor initial

  &:hover
    background button-disabled-bg

  &.button-icon
    background transparent
    color button-disabled-fg

    &:hover
      background transparent
</style>
