<template>
  <div
    class="ui-divider"
    :class="{ 'ui-divider-move': isMove }"
    @mousedown="onDividerMouseDown"
  ></div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";

export default defineComponent({
  name: "ui-divider",
  emits: ["move"],
  setup(props, { emit }) {
    const isMove = ref(false);
    function onDividerMove(event: MouseEvent) {
      emit("move", event);
    }
    return {
      isMove,
      onDividerMouseDown(event: MouseEvent) {
        isMove.value = true;
        document.addEventListener("mousemove", onDividerMove);
        function onMouseUp() {
          isMove.value = false;
          document.removeEventListener("mouseup", onMouseUp);
          document.removeEventListener("mousemove", onDividerMove);
        }

        document.addEventListener("mouseup", onMouseUp);
      },
    };
  },
});
</script>

<style scoped lang="less">
.ui-divider {
  width: 3px;
  height: 100%;
  cursor: ew-resize;
  background-color: grey;
}

.ui-divider-move {
  background-color: #eaa530;
}
</style>
