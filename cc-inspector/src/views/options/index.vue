<template>
  <div class="options">
    <div class="text">哈哈，让你发现了</div>
    <div class="text">不过这里什么都没有</div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
  name: "options",
  components: {},
  setup(props, ctx) {
    return {};
  },
});
</script>
<style scoped lang="less">
.options {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  .text {
    user-select: none;
    font-size: 40px;
  }
}
</style>
