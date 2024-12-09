<template>
  <div v-if="show" class="test">
    <CCSection name="功能测试">
      <CCButton @click="onClickHasCocosGame">Has CocosGame</CCButton>
      <CCButton @click="onClickNoCocosGame">No CocosGame</CCButton>
      <CCButton @click="onTestTree">init tree data</CCButton>
    </CCSection>
  </div>
</template>
<script lang="ts">
import ccui from "@xuyanfeng/cc-ui";
import { ITreeData } from "@xuyanfeng/cc-ui/types/cc-tree/const";
import { defineComponent, ref } from "vue";
import { Msg, Page, PluginEvent } from "../../../core/types";
import { connectBackground } from "../connectBackground";
import { TreeData } from "../data";
import { TestServer } from "./server";
const { CCButton, CCSection } = ccui.components;
export default defineComponent({
  name: "test",
  components: { CCButton, CCSection },
  emits: ["validGame"],
  props: {
    isCocosGame: { type: Boolean, default: false },
  },
  setup(props, { emit }) {
    const show = ref(__DEV__);
    return {
      show,
      onClickHasCocosGame() {
        emit("validGame", true);
      },
      onClickNoCocosGame() {
        emit("validGame", false);
      },
      onTestTree() {
        const data: TreeData = {
          id: "1",
          text: "root",
          active: true,
          children: [],
        };
        const event = new PluginEvent(Page.Inject, Page.Devtools, Msg.TreeInfo, data);
        connectBackground.doCallback(event);
      },
    };
  },
});
</script>
<style scoped lang="less">
.test {
  color: rgb(192, 56, 56);
  font-size: 11%;
}
</style>
