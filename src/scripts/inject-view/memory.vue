<template>
  <div class="memory">
    <canvas class="canvas" ref="elCanvas"></canvas>
    <div class="info">
      <div class="txt">{{ transformSize(memory.usedJSHeapSize) }}</div>
      <div class="txt">{{ transformSize(memory.totalJSHeapSize) }}</div>
      <div class="txt">{{ transformSize(memory.jsHeapSizeLimit) }}</div>
    </div>
  </div>
</template>
<script lang="ts">
import ccui from "@xuyanfeng/cc-ui";
import { defineComponent, onMounted, ref, toRaw } from "vue";
import { Memory, MemoryDraw } from "./memory-draw";
import { transformSize } from "./util";
const { CCButton } = ccui.components;

export default defineComponent({
  name: "memory",
  components: { CCButton },
  setup(props, { emit }) {
    const memoryDraw = new MemoryDraw();
    const memory = ref<Memory>(new Memory());
    setInterval(() => {
      memory.value.update();
    }, 300);

    onMounted(() => {
      const el = toRaw(elCanvas.value);
      if (el) {
        // memoryDraw.init(el as HTMLCanvasElement);
      }
    });
    const elCanvas = ref<HTMLCanvasElement>(null);
    return { memory, transformSize, elCanvas };
  },
});
</script>
<style lang="less" scoped>
.memory {
  display: flex;
  flex-direction: column;
  .canvas {
    display: flex;
    height: 50px;
  }
  .info {
    display: flex;
    flex-direction: row;
    .txt {
      user-select: none;
      margin: 0 3px;
    }
    :first-child {
      margin-left: 0;
    }
    :last-child {
      margin-right: 0;
    }
  }
}
</style>
