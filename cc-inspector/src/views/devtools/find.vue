<template>
  <div class="find-game">
    <span>no games created by cocos creator found!</span>
    <i class="fresh iconfont icon_refresh" @click="onBtnClickUpdatePage"></i>
  </div>
</template>
<script lang="ts">
import { defineComponent, onMounted, onUnmounted } from "vue";
import { Msg, RequestSupportData } from "../../core/types";
import { bridge } from "./bridge";
export default defineComponent({
  name: "find",
  setup(props) {
    let timer: NodeJS.Timer = null;
    onMounted(() => {
      timer = setInterval(() => {
        checkSupport();
      }, 300);
    });
    onUnmounted(() => {
      clearInterval(timer);
    });

    function checkSupport() {
      bridge.send(Msg.RequestSupport, {} as RequestSupportData);
    }
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
