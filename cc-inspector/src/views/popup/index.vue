<template>
    <div class="popup">popup</div>
  </template>
  <script lang="ts">
  import { defineComponent, onMounted, ref, provide, nextTick } from "vue";
  export default defineComponent({
    name: "popup",
    components: {},
    setup(props, ctx) {
      return {}; 
    },
  });
  </script>
  <style scoped lang="less">
  .popup {
      widows: 10px;
      height: 10px;
      background-color: rebeccapurple;
  }
  </style>