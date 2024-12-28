<template>
  <div class="find-game">
    <span>no games created by cocos creator found!</span>
    <i class="fresh iconfont icon_refresh" @click="onBtnClickUpdatePage"></i>
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import { checkSupport } from "./util";
export default defineComponent({
  name: "find",
  setup(props) {
    return {
      onBtnClickUpdatePage() {
        checkSupport();
      },
    };
  },
});
</script>
<style lang="less" scoped>
.find-game {
  display: flex;
  flex: 1;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  user-select: none;

  span {
    margin-right: 20px;
    color: white;
    font-size: 20px;
    user-select: none;
  }

  .fresh {
    cursor: pointer;
    color: white;
    font-size: 20px;

    &:hover {
      color: #cef57b;
    }

    &:active {
      color: #ffaa00;
    }
  }
}
</style>
