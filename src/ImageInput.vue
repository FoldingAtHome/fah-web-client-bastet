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
function compute_max_dims(width, height, maxWidth, maxHeight) {
  if (width <= maxWidth) {
    if (height <= maxHeight) return {width, height}
    return {width, height: Math.floor(maxWidth * maxHeight / height)}
  }

  height = Math.floor(height * maxWidth / width)
  if (height <= maxHeight) return {width: maxWidth, height}

  return {width: Math.floor(maxWidth * maxHeight / height), height: maxHeight}
}


export default {
  name: 'ImageInput',
  emits: ['update:modelValue'],


  props: {
    modelValue: String,
    width:      Number,
    height:     Number,
    minWidth:   {default: 0},
    minHeight:  {default: 0},
  },


  computed: {
    valid() {
      const {width, height} = this.dims
      return (width == 0 && height == 0) ||
        (this.minWidth <= width && this.minHeight <= height)
    },
 },


  data() {
    return {
      input_id: `input-id-${Math.random()}`,
      dims: {width: this.width, height: this.height},
    }
  },


  watch: {
    modelValue() {this.set_image(this.modelValue)}
  },


  mounted() {
    let style    = this.$el.style
    style.width  = `${this.width}px`
    style.height = `${this.height}px`

    this.set_image(this.modelValue)
  },


  methods: {
    set_image(src) {
      let img = src ? `url('${src}')` : 'none'
      this.$el.style['background-image'] = img
    },


    clear() {
      this.set_image('')
      this.$emit('update:modelValue', '')
      this.dims = {width: 0, height: 0}
    },


    load(url) {
      let img = new Image

      img.onload = () => {
        let canvas = document.createElement('canvas')
        let ctx    = canvas.getContext('2d')

        // Compute max image size retaining original aspect ratio
        this.dims =
          compute_max_dims(img.width, img.height, this.width, this.height)

        let scale = img.width / this.dims.width
        canvas.width  = img.width
        canvas.height = img.height

        if (1 < scale) {
          let can2 = document.createElement('canvas')
          let ctx2 = can2.getContext('2d')

          can2.width  = this.dims.width
          can2.height = this.dims.height

          let blur = Math.log2(scale) - 0.5
          if (0 < blur) ctx.filter = `blur(${blur}px)`
          ctx.drawImage(img, 0, 0)
          ctx2.drawImage(canvas, 0, 0, this.dims.width, this.dims.height)
          canvas = can2

        } else ctx.drawImage(img, 0, 0)

        let src = canvas.toDataURL('image/webp')
        this.set_image(src)
        this.$emit('update:modelValue', src)
      }

      img.src = url
    },


    on_change(e) {
      let reader = new FileReader()
      reader.onload = () => {this.load(reader.result)}
      reader.readAsDataURL(e.target.files[0])
    }
  }
}
</script>

<template lang="pug">
.image-input(:class="{error: !valid}")
  label(:for="input_id", title="Click to change image.")
    .fa.fa-times(@click.prevent="clear", title="Remove image.",
      v-if="this.modelValue")
    input(ref="input", type="file", accept="image/*", @change="on_change",
      :id="input_id")

</template>

<style lang="stylus">
.image-input
  display flex
  border var(--border)
  background-repeat no-repeat
  background-position center
  background-size contain

  &:hover
    border-color var(--highlight-color)

  &.error
    border-color var(--error-color)

  label
    flex 1
    display flex
    justify-content end
    padding calc(var(--gap) / 2)
    cursor pointer

    input
      display none

    .fa
      visibility hidden

      &:hover
        color var(--highlight-color)

    &:hover .fa
      visibility visible
</style>
