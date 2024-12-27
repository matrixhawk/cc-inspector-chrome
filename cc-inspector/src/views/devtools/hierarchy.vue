<template>
  <div class="left">
    <div class="tool-btn">
      <div class="text">Node Tree</div>
      <CCButtonGroup :items="buttonGroup" :recover="true"></CCButtonGroup>
    </div>
    <CCInput style="flex: none" placeholder="enter keywords to filter" :data="filterText" v-if="false">
      <slot>
        <i class="matchCase iconfont icon_font_size" @click.stop="onChangeCase" title="match case" :style="{ color: matchCase ? 'red' : '' }"></i>
      </slot>
    </CCInput>
    <CCTree style="flex: 1" ref="elTree" :expand-keys="expandedKeys" :default-expand-all="false" :value="treeData" @node-expand="onNodeExpand" @node-collapse="onNodeCollapse" @node-click="handleNodeClick"></CCTree>
  </div>
</template>
<script lang="ts">
import ccui from "@xuyanfeng/cc-ui";
import { ButtonGroupItem } from "@xuyanfeng/cc-ui/types/cc-button-group/const";
import { storeToRefs } from "pinia";
import { defineComponent, nextTick, onMounted, reactive, ref, toRaw, watch } from "vue";
import { Msg, RequestNodeInfoData, RequestTreeInfoData, ResponseSetPropertyData, ResponseSupportData } from "../../core/types";
import { bridge } from "./bridge";
import { Bus, BusMsg } from "./bus";
import { EngineData, TreeData } from "./data";
import { appStore, RefreshType } from "./store";
import SettingsVue from "./ui/settings.vue";
const { CCTree, CCFootBar, CCDialog, CCInput, CCButton, CCInputNumber, CCSelect, CCButtonGroup, CCCheckBox, CCColor, CCDivider } = ccui.components;
export default defineComponent({
  name: "hierarchy",
  components: { CCButtonGroup, CCInput, CCTree },
  setup() {
    onMounted(() => {
      syncSettings();
    });
    Bus.on(BusMsg.ShowPlace, (data: EngineData) => {
      console.log(toRaw(data));
      _expand(data.engineUUID);
    });
    Bus.on(BusMsg.UpdateSettings, () => {
      syncSettings();
    });
    const btnRefresh: ButtonGroupItem = reactive<ButtonGroupItem>({
      icon: "icon_refresh",
      click: () => {
        onBtnClickUpdateTree();
      },
      visible: true,
    });
    const buttonGroup = ref<ButtonGroupItem[]>([
      btnRefresh,
      {
        icon: "icon_settings",
        click: () => {
          ccui.dialog.showDialog({
            comp: SettingsVue,
            title: "Settings",
          });
        },
      },
    ]);
    function _expand(uuid: string) {
      let expandKeys: Array<string> = [];

      function circle(array: any) {
        for (let i = 0; i < array.length; i++) {
          let item = array[i];
          expandKeys.push(item.uuid);
          if (item.uuid === uuid) {
            return true;
          } else {
            let find = circle(item.children);
            if (find) {
              return true;
            } else {
              expandKeys.pop();
            }
          }
        }
      }

      circle(treeData);

      expandKeys.forEach((key) => {
        if (!expandedKeys.value.find((el) => el === key)) {
          expandedKeys.value.push(key);
        }
      });
      // 高亮uuid
    }
    let timerID: NodeJS.Timer | null = null;

    function _clearTimer() {
      if (timerID !== null) {
        clearInterval(timerID);
        timerID = null;
      }
    }
    function onBtnClickUpdateTree() {
      const id = toRaw(frameID.value);
      bridge.send(Msg.RequstTreeInfo, { frameID: id } as RequestTreeInfoData);
    }
    function onEnableTreeWatch(watch: boolean, time = 300) {
      if (watch) {
        _clearTimer();
        timerID = setInterval(() => {
          onBtnClickUpdateTree();
        }, time);
      } else {
        _clearTimer();
      }
    }
    function syncSettings() {
      const { refreshType, refreshTime } = config.value;
      switch (refreshType) {
        case RefreshType.Auto: {
          btnRefresh.visible = false;
          onEnableTreeWatch(true, refreshTime);
          break;
        }
        case RefreshType.Manual: {
          btnRefresh.visible = true;
          onEnableTreeWatch(false);
        }
      }
    }
    function updateFilterText(val: any) {
      (elTree.value as any)?.filter(val);
    }
    const filterText = ref<string>("");
    watch(filterText, (val) => {
      // TODO: 过滤树
      updateFilterText(val);
    });
    // TODO: 放到store里面
    const { config, frameID } = storeToRefs(appStore());
    const matchCase = ref<boolean>(false);
    const elTree = ref<typeof CCTree>();
    const treeData = ref<TreeData[]>([]);
    function updateNodeInfo() {
      if (selectedUUID) {
        bridge.send(Msg.RequestNodeInfo, { uuid: selectedUUID } as RequestNodeInfoData);
      }
    }
    let selectedUUID: string | null = null;
    function _findUuidInTree(data: TreeData[], targetUUID: string) {
      function circle(tree: TreeData[]) {
        for (let i = 0; i < tree.length; i++) {
          let item: TreeData = tree[i];
          if (item.id === targetUUID) {
            return true;
          }
          if (circle(item.children || [])) {
            return true;
          }
        }
        return false;
      }

      return circle(data);
    }

    bridge.on(Msg.ResponseTreeInfo, (data: Array<TreeData>) => {
      if (!Array.isArray(data)) {
        data = [data];
      }
      treeData.value = data;
      if (!selectedUUID) {
        return;
      }
      const b = _findUuidInTree(toRaw(treeData.value), selectedUUID);
      if (b) {
        updateNodeInfo();
        nextTick(() => {
          if (elTree.value) {
            elTree.value.handChoose(selectedUUID);
          }
        });
      } else {
        selectedUUID = null;
      }
    });

    bridge.on(Msg.ResponseSupport, (data: ResponseSupportData) => {
      const isCocosGame: boolean = data.support;
      if (isCocosGame) {
        syncSettings();
        onBtnClickUpdateTree();
      } else {
        _clearTimer();
        treeData.value.length = 0;
        selectedUUID = null;
      }
    });
    bridge.on(Msg.ResponseSetProperty, (data: ResponseSetPropertyData) => {
      const uuid = data.path[0];
      const key = data.path[1];
      const value = data.data;
      let treeArray: Array<TreeData> = [];

      function circle(array: Array<TreeData>) {
        array.forEach((item) => {
          treeArray.push(item);
          circle(item.children);
        });
      }

      // 更新指定uuid节点的tree的name
      circle(treeData.value);
      let ret = treeArray.find((el) => el.id === uuid);
      if (ret) {
        if (key === "name") {
          ret.text = value;
        }
        if (key === "active") {
          ret.active = !!value;
        }
      }
    });
    const expandedKeys = ref<Array<string>>([]);
    return {
      expandedKeys,
      elTree,
      filterText,
      treeData,
      matchCase,
      frameID,
      buttonGroup,
      handleNodeClick(data: TreeData | null) {
        if (data) {
          selectedUUID = data.id;
          updateNodeInfo();
        } else {
          selectedUUID = null;
        }
      },
      onNodeExpand(data: TreeData) {
        if (data.id) {
          expandedKeys.value.push(data.id);
        }
      },
      onNodeCollapse(data: TreeData) {
        if (data.id) {
          const keys = toRaw(expandedKeys.value);
          const index = keys.findIndex((el) => el === data.id);
          if (index !== -1) {
            keys.splice(index, 1);
          }
          expandedKeys.value = keys;
        }
      },
      // TODO: 暂时这个版本先不实现
      filterNode(value: any, data: any) {
        if (!value) {
          return true;
        } else {
          if (matchCase) {
            // 严格匹配大写
            return data?.name?.indexOf(value) !== -1;
          } else {
            return data?.name?.toLowerCase().indexOf(value.toLowerCase()) !== -1;
          }
        }
      },
      onChangeCase() {
        matchCase.value = !matchCase.value;
        updateFilterText(filterText);
      },
    };
  },
});
</script>
<style lang="less" scoped>
.left {
  display: flex;
  flex-direction: column;
  min-width: 200px;
  width: 300px;

  .tool-btn {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;

    .text {
      padding-left: 5px;
      flex: 1;
      user-select: none;
      font-size: 12px;
      color: white;
    }
  }

  .matchCase {
    width: 30px;
    height: 26px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
  }
}
</style>
