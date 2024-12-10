<template>
  <div class="property-group">
    <CCSection :expand="!fold" :name="group.name" :expand-by-full-header="true" :auto-slot-header="true">
      <template v-slot:header>
        <div style="flex: 1"></div>
        <i style="" @click.stop="onLog" class="print iconfont icon_print"></i>
      </template>
      <div>
        <UiProp v-for="(item, index) in group.data" :key="index" :name="item.name" :value="item.value"> </UiProp>
      </div>
    </CCSection>
  </div>
</template>

<script lang="ts">
import ccui from "@xuyanfeng/cc-ui";
import { defineComponent, PropType, ref } from "vue";
import Bus, { BusMsg } from "../bus";
import { Group } from "../data";
import UiProp from "./ui-prop.vue";
const { CCInput, CCSection, CCButton, CCInputNumber, CCSelect, CCCheckBox, CCColor } = ccui.components;
export default defineComponent({
  name: "property-group",
  components: {
    UiProp,
    CCSection,
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
    return {
      fold,
      onLog() {
        Bus.emit(BusMsg.LogData, [props.group.id]);
      },
    };
  },
});
</script>

<style scoped lang="less">
.property-group {
  .print {
    margin-right: 10px;
    &:hover {
      color: #ffffff;
    }
    &:active {
      color: #ffaa00;
    }
  }
}
</style>
