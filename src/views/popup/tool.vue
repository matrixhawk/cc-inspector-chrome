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
        data.data.forEach((item) => {
          item.getTryInfos().forEach((info) => {
            let arr = list.value.find((item) => item.type === info.type);
            if (!arr) {
              arr = new ToolItem(info.type);
              arr.title = data.keys[info.type] || info.type || "推荐列表";
              list.value.push(arr);
            }
            arr.items.push({ name: info.name, url: info.url, store: item.store });
          });
        });
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
