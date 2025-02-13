<template>
  <div class="tools ccui-scrollbar">
    <Item v-for="(item, index) in list" :key="index" :data="item"></Item>
  </div>
</template>
<script lang="ts">
import ccui from "@xuyanfeng/cc-ui";
import { defineComponent, onMounted, ref } from "vue";
import { getAdData } from "../../scripts/inject-view/loader";
import Item from "./tool-item.vue";
import { ToolItem } from "./type";
const { CCButton } = ccui.components;
export default defineComponent({
  name: "tools",
  components: { CCButton, Item },
  setup(props, { emit }) {
    const list = ref<ToolItem[]>([]);
    onMounted(async () => {
      const data = await getAdData();
      if (data) {
        data.sortByName();
        console.log(data);
        const result: ToolItem[] = [];
        data.data.forEach((item) => {
          item.getTryInfos().forEach((info) => {
            let arr = result.find((item) => item.type === info.type);
            if (!arr) {
              arr = new ToolItem(info.type);
              arr.title = data.keys[info.type] || info.type || "推荐列表";
              result.push(arr);
            }
            arr.items.push({ name: info.name, url: info.url, store: item.store });
          });
        });
        // 按照type逆序，主要是为了保证和之前的版本一致
        result.sort((a, b) => b.type.localeCompare(a.type));
        list.value = result;
      }
    });
    return {
      list,
    };
  },
});
</script>
<style lang="less" scoped>
.tools {
  display: flex;
  flex-direction: column;
  overflow: auto;
}
</style>
