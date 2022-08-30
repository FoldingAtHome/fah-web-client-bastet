<script>
import util from './util.js'


export default {
  name: 'LogView',
  props: ['peers', 'query'],


  data() {
    return {
      search: '',
      errors: false,
      warnings: false,
      follow: true,
      util
    }
  },


  watch: {
    'data.log.length'() {if (this.follow) this.scroll_to_end()}
  },


  computed: {
    peer() {return this.peers[0]},
    data() {return this.peer.state.data},


    match_exp() {
      try {
        let exp = new RegExp(this.search)

        if (this.errors || this.warnings) {
          let exp2 = new RegExp(':[' + (this.errors ? 'E' : '') +
                                (this.warnings ? 'W' : '') + '] :')
          return {[Symbol.match](s) {return s.match(exp) && s.match(exp2)}}
        }

        return exp

      } catch (e) {console.log(e)}
    }
  },


  mounted()   {
    this.search = this.query
    this.peer.log_enable(true)
  },


  unmounted() {this.peer.log_enable(false)},


  methods: {
    match(s) {
      if (this.match_exp) return s.match(this.match_exp)
      return true
    },


    reset() {
      this.search = ''
      this.errors = this.warnings = false
    },


    scroll_to_end() {this.$refs.log.scrollTop = this.$refs.log.scrollHeight}
  }
}
</script>

<template lang="pug">
.log-view.page-view(v-if="data.config")
  .view-header-container
    .view-header
      FAHLogo
      h2 Work Unit Log

      .actions
        Button(text="Close", icon="times", route="/")

  .view-body
    .log-controls
      label Search
      input(v-model="search", type="text")
      label(title="Filter log for error messages.").
        #[input(v-model="errors", type="checkbox")] Errors
      label(title="Filter log for warning messages.").
        #[input(v-model="warnings", type="checkbox")] Warnings
      Button(text="Reset", icon="repeat", @click="reset")
      label(title="Automatically scroll to the bottom of the log.").
        #[input(v-model="follow", type="checkbox")] Follow

    .log-container
      .log(ref="log")
        .log-line(v-for="line in this.data.log", v-show="match(line)",
          v-html="util.ansi2html(line)")
</template>

<style lang="stylus">
@import('colors.styl')

.log-view
  position fixed
  top 0
  left 0
  width 100vw
  height 100vh
  margin-left 0
  display flex
  flex-direction column

  .view-header-container .view-header
    padding 1em
    max-width 100vw

    .actions
      flex 1

  .view-body
    width 100%
    height 100%
    max-width 100%
    padding 0
    flex 1
    align-self stretch
    display flex
    flex-direction column

    .log-controls
      padding 0.5em
      display flex
      gap 0.5em
      align-items center

      input[type=text]
        flex 1

    .log-container
      flex 1
      position relative

      .log
        position absolute
        height 100%
        width 100%
        color #7f7f7f
        background #000
        padding 1em
        overflow scroll

        .log-line
          white-space nowrap
</style>
