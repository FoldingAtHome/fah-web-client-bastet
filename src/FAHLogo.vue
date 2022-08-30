<template lang="pug">
.fah-logo
  a(href="https://foldingathome.org/", target="_blank")
    div FOLDING
    div #[span @]HOME
</template>

<style lang="stylus">
.fah-logo a
  display inline-block
  font-weight bold
  line-height 0.8em
  font-family mono
  font-size 28pt

  > div:nth-child(1)
    font-size calc(28pt * 5/7)
    transform scaleY(calc(7/5))

  > div
    display flex

    > span
      margin-top -4px
</style>
