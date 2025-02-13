<template>
  <div class="tool-item">
    <div>{{ data.title }}</div>
    <div style="overflow: auto; display: flex; flex: 1" class="ccui-scrollbar">
      <ol>
        <li v-for="(item, index) in data.items" :key="index">
          <a v-if="item.store" :href="item.store" target="_blank" class="iconfont icon_shop_cart icon"></a>
          <a :href="item.url" target="_blank" class="link" @click="onClickTry($event, item.url)"> {{ item.name }} </a>
        </li>
      </ol>
    </div>
  </div>
</template>
<script lang="ts">
import ccui from "@xuyanfeng/cc-ui";
import { defineComponent, PropType } from "vue";
import { ga } from "../../ga";
import { GA_EventName } from "../../ga/type";
import { ToolItem } from "./type";
const { CCButton } = ccui.components;
export default defineComponent({
  name: "tool-item",
  components: { CCButton },
  props: {
    data: {
      type: Object as PropType<ToolItem>,
      required: true,
      default: () => new ToolItem(""),
    },
  },
  setup(props, { emit }) {
    return {
      onClickTry(event: MouseEvent, url: string) {
        ga.fireEventWithParam(GA_EventName.Popup, url);
      },
    };
  },
});
</script>
<style lang="less" scoped>
.tool-item {
  display: flex;
  flex-direction: column;
}
</style>
