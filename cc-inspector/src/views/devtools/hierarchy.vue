<template>
  <div class="left">
    <CCDock name="Hierarchy">
      <CCInput style="flex: none" placeholder="enter keywords to filter" :data="filterText" v-if="false">
        <slot>
          <i class="matchCase iconfont icon_font_size" @click.stop="onChangeCase" title="match case" :style="{ color: matchCase ? 'red' : '' }"></i>
        </slot>
      </CCInput>
      <CCTree style="flex: 1" ref="elTree" :expand-keys="expandedKeys" :default-expand-all="false" :value="treeData" @node-expand="onNodeExpand" @node-collapse="onNodeCollapse" @node-click="handleNodeClick" @node-unclick="handleNodeUnclick"></CCTree>
    </CCDock>
  </div>
</template>
<script lang="ts">
import ccui from "@xuyanfeng/cc-ui";
import { storeToRefs } from "pinia";
import { defineComponent, nextTick, onMounted, onUnmounted, ref, toRaw, watch } from "vue";
import { Msg, PluginEvent, RequestTreeInfoData, ResponseSetPropertyData } from "../../core/types";
import { bridge } from "./bridge";
import { Bus, BusMsg } from "./bus";
import { EngineData, TreeData } from "./data";
import { appStore } from "./store";
import { Timer } from "./timer";
const { CCTree, CCFootBar, CCDock, CCDialog, CCInput, CCButton, CCInputNumber, CCSelect, CCButtonGroup, CCCheckBox, CCColor, CCDivider } = ccui.components;
export default defineComponent({
  name: "hierarchy",
  components: { CCButtonGroup, CCInput, CCTree, CCDock },
  setup() {
    onMounted(() => {});
    const funcShowPlace = (data: EngineData) => {
      console.log(toRaw(data));
      _expand(data.engineUUID);
    };
    const funcEnableSchedule = (b: boolean) => {
      if (b) {
        timer.create();
      } else {
        timer.clean();
      }
    };
    const timer: Timer = new Timer(() => {
      updateTree();
    });
    onMounted(() => {
      Bus.on(BusMsg.ShowPlace, funcShowPlace);
      Bus.on(BusMsg.EnableSchedule, funcEnableSchedule);
      timer.create();
    });
    onUnmounted(() => {
      Bus.off(BusMsg.ShowPlace, funcShowPlace);
      Bus.off(BusMsg.EnableSchedule, funcEnableSchedule);
      timer.clean();
    });
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
    function updateTree() {
      console.log("update tree info");
      const id = toRaw(frameID.value);
      bridge.send(Msg.RequstTreeInfo, { frameID: id } as RequestTreeInfoData);
    }

    function updateFilterText(val: any) {
      (elTree.value as any)?.filter(val);
    }
    const filterText = ref<string>("");
    watch(filterText, (val) => {
      // TODO: 过滤树
      updateFilterText(val);
    });
    const { config, frameID } = storeToRefs(appStore());
    const matchCase = ref<boolean>(false);
    const elTree = ref<typeof CCTree>();
    const treeData = ref<TreeData[]>([]);
    let selectedUUID: string | null = null;
    bridge.on(Msg.ResponseTreeInfo, (event: PluginEvent) => {
      let data: Array<TreeData> = event.data;
      if (!Array.isArray(data)) {
        data = [data];
      }
      treeData.value = data;
      nextTick(() => {
        if (elTree.value) {
          elTree.value.handChoose(selectedUUID);
        }
      });
    });

    bridge.on(Msg.ResponseSetProperty, (event: PluginEvent) => {
      let data: ResponseSetPropertyData = event.data;
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
    function updateSelect(uuid: string | null) {
      selectedUUID = uuid;
      Bus.emit(BusMsg.SelectNode, uuid);
    }
    return {
      expandedKeys,
      elTree,
      filterText,
      treeData,
      matchCase,
      frameID,
      handleNodeUnclick() {
        updateSelect(null);
      },
      handleNodeClick(data: TreeData | null) {
        if (data) {
          updateSelect(data.id);
        } else {
          updateSelect(null);
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
