<template>
  <div v-if="show" class="test">
    <CCSection name="功能测试" :expand="config.expandTest" @change="onExpandTest">
      <CCButton @click="onClickHasCocosGame">Has CocosGame</CCButton>
      <CCButton @click="onClickNoCocosGame">No CocosGame</CCButton>
      <CCButton @click="onTestTree">init tree data</CCButton>
      <CCButton @click="onFrames">test frame</CCButton>
      <CCButton @click="onTestNodeInfo">test node info</CCButton>
      <CCButton @click="onNull">test null</CCButton>
      <CCButton @click="onTerminal">onTerminal</CCButton>
    </CCSection>
  </div>
</template>
<script lang="ts">
import ccui from "@xuyanfeng/cc-ui";
import { storeToRefs } from "pinia";
import { defineComponent, ref } from "vue";
import { Msg, Page, PluginEvent, ResponseUpdateFramesData } from "../../../core/types";
import { Terminal } from "../../../scripts/terminal";
import { bridge } from "../bridge";
import { FrameDetails, Group, InvalidData, NodeInfoData, TreeData } from "../data";
import { appStore } from "../store";
import { testServer } from "./server";
const { CCButton, CCSection } = ccui.components;
export default defineComponent({
  name: "test",
  components: { CCButton, CCSection },
  emits: ["validGame"],
  props: {
    isCocosGame: { type: Boolean, default: false },
  },
  setup(props, { emit }) {
    const { config } = storeToRefs(appStore());
    // 仅在web环境显示
    const show = ref(__DEV__ && !(chrome && chrome.runtime));
    // 测试发送的是纯数据
    const testData = {
      uuid: "d1NHXHs35F1rbFJZKeigkl",
      group: [
        {
          id: "d1NHXHs35F1rbFJZKeigkl",
          name: "cc.Scene",
          data: [
            {
              name: "position",
              value: {
                id: "b9068b6f-8c1c-4d88-ac52-52cc09b37c1c",
                type: "Vec3",
                readonly: false,
                path: [],
                data: [
                  { name: "x", value: { id: "be42ab63-d767-466e-8ba4-fb1b21201c54", type: "Number", readonly: false, path: ["d1NHXHs35F1rbFJZKeigkl", "x"], data: 0 } },
                  { name: "y", value: { id: "498db9b2-e4a5-4c91-a546-1c3233e9bb50", type: "Number", readonly: false, path: ["d1NHXHs35F1rbFJZKeigkl", "y"], data: 0 } },
                  { name: "z", value: { id: "400e184f-d754-4b66-aeb9-9f1feb1136a3", type: "Number", readonly: false, path: ["d1NHXHs35F1rbFJZKeigkl", "z"], data: 0 } },
                ],
              },
            },
          ],
        },
      ],
    };
    return {
      config,
      show,
      onExpandTest(v: boolean) {
        console.log(v);
        config.value.expandTest = v;
        appStore().save();
      },
      onClickHasCocosGame() {
        emit("validGame", true);
      },
      onClickNoCocosGame() {
        emit("validGame", false);
      },
      onTerminal() {
        const t = new Terminal("flag");
        const event = new PluginEvent(Page.Background, Page.Background, Msg.ResponseTreeInfo, "");
        console.log(...t.message("1"));
        console.log(...t.log("newline", true));
        console.log(...t.log("oneline", false));
        console.log(...t.disconnect("disconnect"));
        console.log(...t.connect("connect"));
        console.log(...t.red("red"));
        console.log(...t.green("green"));
        console.log(...t.blue("blue"));
        console.log(...t.chunkMessage(event.toChunk()));
      },
      onTestTree() {
        const data: TreeData = {
          id: "1",
          text: "root",
          active: true,
          children: [],
        };
        const event = new PluginEvent(Page.Inject, Page.Devtools, Msg.ResponseTreeInfo, data);
        bridge.emit(event);
      },
      onFrames() {
        const data: FrameDetails[] = [
          { url: "url1", frameID: 1 },
          { url: "url2", frameID: 2 },
        ];
        const event = new PluginEvent(Page.Background, Page.Devtools, Msg.ResponseUpdateFrames, data as ResponseUpdateFramesData);
        testServer.send(event);
      },
      onTestNodeInfo() {
        const event = new PluginEvent(Page.Background, Page.Devtools, Msg.ResponseTreeInfo, testData);
        testServer.send(event);
      },
      onNull() {
        const data = new NodeInfoData("", [new Group("", "1").buildProperty("dependAssets", new InvalidData("Null"))]);
        const event = new PluginEvent(Page.Background, Page.Devtools, Msg.ResponseTreeInfo, data);
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
