<template>
  <div v-if="show" class="test">
    <CCSection name="功能测试" :expand="false">
      <CCButton @click="onClickHasCocosGame">Has CocosGame</CCButton>
      <CCButton @click="onClickNoCocosGame">No CocosGame</CCButton>
      <CCButton @click="onTestTree">init tree data</CCButton>
      <CCButton @click="onFrames">test frame</CCButton>
    </CCSection>
  </div>
</template>
<script lang="ts">
import ccui from "@xuyanfeng/cc-ui";
import { ITreeData } from "@xuyanfeng/cc-ui/types/cc-tree/const";
import { defineComponent, ref } from "vue";
import { Msg, Page, PluginEvent } from "../../../core/types";
import { connectBackground } from "../connectBackground";
import { FrameDetails, TreeData } from "../data";
import { testServer, TestServer } from "./server";
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
      onFrames() {
        const data: FrameDetails[] = [
          { url: "url1", frameID: 1 },
          { url: "url2", frameID: 2 },
        ];
        const event = new PluginEvent(Page.Background, Page.Devtools, Msg.UpdateFrames, data);
        testServer.send(event);
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
