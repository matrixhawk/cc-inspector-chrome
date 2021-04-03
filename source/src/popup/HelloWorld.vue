<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
  </div>
</template>

<script lang="ts">
import {Component, Prop, Vue} from "vue-property-decorator";

@Component
export default class HelloWorld extends Vue {
  @Prop()
  msg = ''

  created() {
    debugger
    console.log(this.msg)
  }
}
</script>

<style scoped lang="less">

</style>
