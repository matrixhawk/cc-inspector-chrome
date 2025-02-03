<template>
  <div class="iconfont icon_refresh_one refresh" @animationend="onAnimationend" @click="onClick" :class="getClass()"></div>
</template>
<script lang="ts">
import ccui from "@xuyanfeng/cc-ui";
import { defineComponent, ref, watch } from "vue";
import { RotateType } from "./const";
const { CCButton } = ccui.components;
export default defineComponent({
  name: "refresh",
  components: { CCButton },
  props: {
    type: { type: String, default: RotateType.None },
  },
  setup(props, { emit }) {
    const rotateType = ref(props.type);
    watch(
      () => props.type,
      (v) => {
        rotateType.value = v;
      }
    );
    return {
      onAnimationend() {
        rotateType.value = RotateType.None;
      },
      onClick() {
        if (rotateType.value === RotateType.Loop) {
          return;
        }
        rotateType.value = RotateType.One;
      },
      getClass() {
        if (rotateType.value === RotateType.Loop) {
          return "refresh-rotate-loop";
        }
        if (rotateType.value === RotateType.One) {
          return "refresh-rotate-one";
        }
        if (rotateType.value === RotateType.None) {
          return "";
        }
        return "";
      },
    };
  },
});
</script>
<style lang="less" scoped>
@keyframes rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(-360deg);
  }
}
@time-loop: 1s;
@time-one: 0.4s;

.refresh {
  margin: 0 3px;
  cursor: pointer;
  &:hover {
    color: rgb(250, 207, 161);
  }
  &:active {
    color: #ffaa00;
  }
}
.refresh-rotate-loop {
  animation: rotate @time-loop linear infinite reverse;
}

.refresh-rotate-one {
  animation: rotate @time-one linear 1 reverse;
}
</style>
