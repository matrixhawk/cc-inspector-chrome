<template>
    <div class="devtools">devtools</div>
  </template>
  <script lang="ts">
  import { defineComponent, onMounted, ref, provide, nextTick } from "vue";
  export default defineComponent({
    name: "devtools",
    components: {},
    setup(props, ctx) {
      return {}; 
    },
  });
  </script>
  <style scoped lang="less">
  .devtools {
      widows: 10px;
      height: 10px;
      background-color: rebeccapurple;
  }
  </style>