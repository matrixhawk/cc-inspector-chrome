<template>
  <div class="right">
    <CCDock name="Inspector">
      <div class="inspector" @contextmenu.prevent.stop="onMenu">
        <Properties v-if="treeItemData" :data="treeItemData"></Properties>
      </div>
    </CCDock>
  </div>
</template>
<script lang="ts">
import ccui from "@xuyanfeng/cc-ui";
import { IUiMenuItem } from "@xuyanfeng/cc-ui/types/cc-menu/const";
import { defineComponent, onMounted, onUnmounted, ref } from "vue";
import { Msg, PluginEvent, RequestNodeInfoData, RequestObjectData, ResponseObjectData, ResponseSupportData } from "../../core/types";
import { bridge } from "./bridge";
import { Bus, BusMsg } from "./bus";
import { NodeInfoData, ObjectData } from "./data";
import { Timer } from "./timer";
import Properties from "./ui/propertys.vue";
const { CCDock } = ccui.components;
export default defineComponent({
  components: { Properties, CCDock },
  setup() {
    function updateNodeInfo() {
      if (selectedUUID) {
        console.log(`update node info: ${selectedUUID}`);
        bridge.send(Msg.RequestNodeInfo, { uuid: selectedUUID } as RequestNodeInfoData);
      } else {
        // TODO: 需要检查当前的这个节点是否有效
        treeItemData.value = null;
      }
    }
    const timer = new Timer(updateNodeInfo);
    const treeItemData = ref<NodeInfoData | null>(null);
    const funcEnableSchedule = (b: boolean) => {
      if (b) {
        timer.create();
      } else {
        timer.clean();
      }
    };
    let selectedUUID: string | null = null;
    const funSelectNode = (uuid: string | null) => {
      selectedUUID = uuid;
      updateNodeInfo();
    };
    onMounted(() => {
      Bus.on(BusMsg.SelectNode, funSelectNode);
      Bus.on(BusMsg.EnableSchedule, funcEnableSchedule);
      timer.create();
    });
    onUnmounted(() => {
      Bus.off(BusMsg.SelectNode, funSelectNode);
      Bus.off(BusMsg.EnableSchedule, funcEnableSchedule);
      timer.clean();
    });
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
    return {
      treeItemData,
      onMenu(evnet: MouseEvent) {
        const menus: IUiMenuItem[] = [];
        menus.push({
          name: "update node info",
          callback: () => {
            updateNodeInfo();
          },
        });
        ccui.menu.showMenuByMouseEvent(evnet, menus);
      },
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
  .inspector {
    display: flex;
    flex: 1;
    flex-direction: column;
    overflow: hidden;
  }
}
</style>
