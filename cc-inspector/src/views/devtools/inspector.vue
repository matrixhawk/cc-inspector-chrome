<template>
  <div class="right">
    <CCDock name="Inspector">
      <Properties v-if="treeItemData" :data="treeItemData"></Properties>
    </CCDock>
  </div>
</template>
<script lang="ts">
import ccui from "@xuyanfeng/cc-ui";
import { defineComponent, ref } from "vue";
import { Msg, PluginEvent, RequestObjectData, ResponseObjectData, ResponseSupportData } from "../../core/types";
import { bridge } from "./bridge";
import { Bus, BusMsg } from "./bus";
import { NodeInfoData, ObjectData } from "./data";
import Properties from "./ui/propertys.vue";
const { CCDock } = ccui.components;
export default defineComponent({
  components: { Properties, CCDock },
  setup() {
    const treeItemData = ref<NodeInfoData | null>(null);
    bridge.on(Msg.ResponseSupport, (event: PluginEvent) => {
      let data: ResponseSupportData = event.data;
      const isCocosGame: boolean = data.support;
      if (isCocosGame) {
      } else {
        treeItemData.value = null;
      }
    });
    bridge.on(Msg.ResponseNodeInfo, (event: PluginEvent) => {
      try {
        // 因为要用到class的一些属性，传递过来的是纯数据，所以需要重新序列化一下
        let eventData: NodeInfoData = event.data;
        const nodeInfo = new NodeInfoData(eventData.uuid, eventData.group).parse(eventData);
        treeItemData.value = nodeInfo;
      } catch (error) {
        console.error(error);
        ccui.footbar.showError(error, { title: "parse property error" });
      }
    });
    /**
     * 请求属性的列表，如果一个属性请求失败，会阻断后续的相同请求，因为都已经失败了，就没必要再响应请求了
     */
    const requestList: Array<{ id: string; cb: Function }> = [];

    bridge.on(Msg.ResponseObjectItemData, (event: PluginEvent) => {
      const requestData: ResponseObjectData = event.data;
      if (requestData.id !== null) {
        let findIndex = requestList.findIndex((el) => el.id === requestData.id);
        if (findIndex > -1) {
          let del = requestList.splice(findIndex, 1)[0];
          del.cb(requestData.data);
        }
      }
    });
    Bus.on(BusMsg.RequestObjectData, (data: ObjectData, cb: Function) => {
      if (!data.id || requestList.find((el) => el.id === data.id)) {
        return;
      }
      requestList.push({ id: data.id, cb });
      bridge.send(Msg.RequestObjectItemData, data as RequestObjectData);
    });
    // TODO: 需要检查当前的这个节点是否有效
    // treeItemData.value = null;
    return {
      treeItemData,
    };
  },
});
</script>
<style lang="less" scoped>
.right {
  flex: 1;
  display: flex;
  overflow-x: hidden;
  overflow-y: overlay;

  &::-webkit-scrollbar {
    width: 6px;
    background: #999;
    border-radius: 2px;
    height: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #333;
    border-radius: 2px;
  }
}
</style>
