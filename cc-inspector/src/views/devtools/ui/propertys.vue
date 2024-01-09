<template>
  <div id="prop">
    <PropertyGroup
      v-for="(group, index) in data.group"
      :key="index"
      :group="group"
    ></PropertyGroup>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, watch } from "vue";
import UiProp from "./ui-prop.vue";
import { Group, NodeInfoData } from "../data";
import PropertyGroup from "../ui/property-group.vue";
import Bus, { BusMsg } from "../bus";

export default defineComponent({
  components: { PropertyGroup, UiProp },
  props: {
    data: {
      type: Object as PropType<NodeInfoData>,
      default: () => {
        return {};
      },
    },
  },
  setup(props, context) {
    function _evalCode(code: string) {
      if (chrome && chrome.devtools) {
        chrome.devtools.inspectedWindow.eval(code);
      } else {
        console.log(code);
      }
    }
    watch(props.data, (newValue: NodeInfoData, oldValue: NodeInfoData) => {
      if (newValue.uuid !== oldValue.uuid) {
        // 切换node，全部展开属性
        Bus.emit(BusMsg.FoldAllGroup, false);
      }
    });
    return {};
  },
});
</script>

<style scoped lang="less">
#prop {
}
</style>
