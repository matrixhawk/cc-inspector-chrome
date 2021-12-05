<template>
  <div class="ui-divider" :class="{'ui-divider-move':isMove}"
       @mousedown="onDividerMouseDown">
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import {Prop, Emit} from "vue-property-decorator";

@Component({
  name: "ui-divider",
  components: {}
})
export default class UiDivider extends Vue {
  private isMove = false;

  created() {
  }

  mounted() {
  }

  @Emit("move")
  onDividerMove(event: MouseEvent) {
    return event;
  }

  onDividerMouseDown(event: MouseEvent) {
    this.isMove = true;
    document.addEventListener("mousemove", this.onDividerMove);

    const self = this;

    function onMouseUp() {
      self.isMove = false;
      document.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("mousemove", self.onDividerMove);
    }

    document.addEventListener("mouseup", onMouseUp)
  }
}
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
