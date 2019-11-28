<template>
  <div class="app-header">
    <div class="back" :class="{hidden: hideReturn}" @click="goBack">
      <i class="cubeic-back"></i>
    </div>
    <div class="title">
      <template v-if="title">{{title}}</template>
      <slot v-else></slot>
    </div>
    <div class="right">
      <slot name="right"></slot>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    to: String,
    backFn: Function,
    title: String,
    hideReturn: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    goBack() {
      if (this.backFn) {
        this.backFn()
      } else if (this.to) {
        this.$router.push(this.to)
      } else {
        this.$router.back()
      }
    }
  }
};
</script>
