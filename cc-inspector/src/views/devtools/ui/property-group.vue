<template>
  <div class="property-group">
    <div
      class="header"
      @click="onClickHeader"
      @mouseenter="showLogBtn = true"
      @mouseleave="showLogBtn = false"
    >
      <div style="margin: 0 5px">
        <i v-if="fold" class="el-icon-caret-right"></i>
        <i v-if="!fold" class="el-icon-caret-bottom"></i>
      </div>
      <div style="flex: 1">
        {{ group.name }}
      </div>
      <CCButton
        style="margin-right: 10px"
        v-show="showLogBtn"
        type="success"
        icon="el-icon-chat-dot-round"
        @click.stop="onLog"
      >
      </CCButton>
    </div>
    <div class="content" v-show="!fold">
      <ui-prop
        v-for="(item, index) in group.data"
        :key="index"
        :name="item.name"
        :value="item.value"
      >
      </ui-prop>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, PropType } from "vue";
import { Group } from "../data";
import UiProp from "./ui-prop.vue";
import Bus, { BusMsg } from "../bus";
import ccui from "@xuyanfeng/cc-ui";
const { CCInput, CCButton, CCInputNumber, CCSelect, CCCheckBox, CCColor } =
  ccui.components;
export default defineComponent({
  name: "property-group",
  components: {
    UiProp,
    CCInput,
    CCButton,
    CCInputNumber,
    CCSelect,
    CCCheckBox,
    CCColor,
  },
  props: {
    group: {
      type: Object as PropType<Group>,
      default: () => {
        return new Group("test");
      },
    },
  },
  setup(props, context) {
    Bus.on(BusMsg.FoldAllGroup, (b: boolean) => {
      fold.value = b;
    });
    const fold = ref(false);
    const showLogBtn = ref(false);
    return {
      showLogBtn,
      fold,
      onLog() {
        Bus.emit(BusMsg.LogData, [props.group.id]);
      },

      onClickHeader() {
        fold.value = !fold.value;
      },
    };
  },
});
</script>

<style scoped lang="less">
.property-group {
  .header {
    height: 40px;
    display: flex;
    flex-direction: row;
    align-items: center;
    user-select: none;
    cursor: pointer;
    border-bottom: 1px #6d6d6d solid;
    background-color: #1da1f7;
  }

  .header:hover {
    color: #6d6d6d;
  }

  .content {
    padding: 0 5px;
  }
}
</style>
