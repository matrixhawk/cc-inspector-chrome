<template>
  <div id="devtools">
    <Test @valid-game="testValidGame"> </Test>
    <div class="head" v-show="iframes.length > 1">
      <div class="label">inspect target:</div>
      <CCSelect v-model:value="frameID" @change="onChangeFrame" :data="getFramesData()"> </CCSelect>
    </div>
    <div v-show="isShowDebug" class="find">
      <div v-if="false">
        <CCButton type="success" @click="onMemoryTest">内存测试</CCButton>
        <span>JS堆栈限制: {{ memory.performance.jsHeapSizeLimit }}</span>
        <span>JS堆栈大小: {{ memory.performance.totalJSHeapSize }}</span>
        <span>JS堆栈使用: {{ memory.performance.usedJSHeapSize }}</span>
      </div>
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
      <CCDivider></CCDivider>
      <div class="right">
        <Properties v-if="treeItemData" :data="treeItemData"></Properties>
      </div>
    </div>
    <div v-show="!isShowDebug" class="no-find">
      <span>no games created by cocos creator found!</span>
      <i class="fresh iconfont icon_refresh" @click="onBtnClickUpdatePage"></i>
    </div>
    <CCDialog></CCDialog>
    <CCFootBar :version="version"></CCFootBar>
  </div>
</template>

<script lang="ts">
import ccui from "@xuyanfeng/cc-ui";
import { ButtonGroupItem } from "@xuyanfeng/cc-ui/types/cc-button-group/const";
import { Option } from "@xuyanfeng/cc-ui/types/cc-select/const";
import { storeToRefs } from "pinia";
import { defineComponent, nextTick, onMounted, reactive, ref, toRaw, watch } from "vue";
import PluginConfig from "../../../cc-plugin.config";
import { Msg, PluginEvent } from "../../core/types";
import { bridge } from "./bridge";
import Bus, { BusMsg } from "./bus";
import { EngineData, FrameDetails, Info, NodeInfoData, ObjectData, ObjectItemRequestData, TreeData } from "./data";
import { appStore, RefreshType } from "./store";
import Test from "./test/test.vue";
import Properties from "./ui/propertys.vue";
import SettingsVue from "./ui/settings.vue";
ccui.components.CCAd;
const { CCTree, CCFootBar, CCDialog, CCInput, CCButton, CCInputNumber, CCSelect, CCButtonGroup, CCCheckBox, CCColor, CCDivider } = ccui.components;
interface FrameInfo {
  label: string;
  value: number;
}

export default defineComponent({
  components: { Test, CCFootBar, CCDialog, CCTree, CCDivider, CCButtonGroup, Properties, SettingsVue, CCInput, CCButton, CCInputNumber, CCSelect, CCCheckBox, CCColor },
  name: "devtools",
  props: {},
  setup(props, ctx) {
    appStore().init();
    const { config } = storeToRefs(appStore());
    const treeItemData = ref<NodeInfoData | null>(null);
    const isShowDebug = ref<boolean>(false);
    const frameID = ref<number>(0);
    const iframes = ref<Array<FrameInfo>>([]);
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
    function _checkSelectedUUID() {
      if (selectedUUID) {
        const b = _findUuidInTree(toRaw(treeData.value), selectedUUID);
        if (b) {
          return true;
        }
      }
      selectedUUID = null;
      treeItemData.value = null;
      return false;
    }

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

    /**
     * 请求属性的列表，如果一个属性请求失败，会阻断后续的相同请求，因为都已经失败了，就没必要再响应请求了
     */
    const requestList: Array<{ id: string; cb: Function }> = [];

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

    // 问题：没有上下文的权限，只能操作DOM
    function _executeScript(para: Object) {
      // chrome.tabs.executeScript()//v2版本使用的函数
      const tabID = chrome.devtools.inspectedWindow.tabId;
      chrome.scripting.executeScript({ files: ["js/execute.js"], target: { tabId: tabID } }, (results: chrome.scripting.InjectionResult[]) => {});
    }

    function _inspectedCode() {
      let injectCode = "";
      chrome.devtools.inspectedWindow.eval(injectCode, (result, isException) => {
        if (isException) {
          console.error(isException);
        } else {
          console.log(`执行结果：${result}`);
        }
      });
    }
    const elTree = ref<typeof CCTree>();
    function _initChromeRuntimeConnect() {
      const msgFunctionMap: Record<string, Function> = {};
      msgFunctionMap[Msg.TreeInfo] = (data: Array<TreeData>) => {
        isShowDebug.value = true;
        if (!Array.isArray(data)) {
          data = [data];
        }
        treeData.value = data;
        if (_checkSelectedUUID()) {
          updateNodeInfo();
          nextTick(() => {
            if (elTree.value) {
              elTree.value.handChoose(selectedUUID);
            }
          });
        }
      };
      msgFunctionMap[Msg.Support] = (isCocosGame: boolean) => {
        isShowDebug.value = isCocosGame;
        if (isCocosGame) {
          syncSettings();
          onBtnClickUpdateTree();
        } else {
          _clearTimer();
          treeData.value.length = 0;
          treeItemData.value = null;
          selectedUUID = null;
        }
      };
      msgFunctionMap[Msg.NodeInfo] = (eventData: NodeInfoData) => {
        isShowDebug.value = true;
        try {
          const nodeInfo = new NodeInfoData(eventData.uuid, eventData.group).parse(eventData);
          treeItemData.value = nodeInfo;
        } catch (error) {
          console.error(error);
          ccui.footbar.showError(error, { title: "parse property error" });
        }
      };
      msgFunctionMap[Msg.MemoryInfo] = (eventData: any) => {
        memory.value = eventData;
      };
      msgFunctionMap[Msg.UpdateProperty] = (data: Info) => {
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
      };
      msgFunctionMap[Msg.UpdateFrames] = (details: FrameDetails[]) => {
        // 先把iframes里面无效的清空了
        iframes.value = iframes.value.filter((item) => {
          details.find((el) => el.frameID === item.value);
        });

        // 同步配置
        details.forEach((item) => {
          let findItem = iframes.value.find((el) => el.value === item.frameID);
          if (findItem) {
            findItem.label = item.url;
          } else {
            iframes.value.push({
              label: item.url,
              value: item.frameID,
            });
          }
        });
        // 第一次获取到frame配置后，自动获取frame数据
        if (frameID === null && iframes.value.length > 0 && !iframes.value.find((el) => el.value === frameID.value)) {
          frameID.value = iframes[0].value;
          onChangeFrame();
        }
      };
      msgFunctionMap[Msg.GetObjectItemData] = (requestData: ObjectItemRequestData) => {
        if (requestData.id !== null) {
          let findIndex = requestList.findIndex((el) => el.id === requestData.id);
          if (findIndex > -1) {
            let del = requestList.splice(findIndex, 1)[0];
            del.cb(requestData.data);
          }
        }
      };
      // 接收来自background.js的消息数据
      bridge.onMessage = (data: PluginEvent, sender: any) => {
        if (!data) {
          return;
        }
        debugger;
        if (data.isTargetDevtools()) {
          PluginEvent.finish(data);
          const { msg } = data;
          if (msg) {
            const func = msgFunctionMap[msg];
            if (func) {
              func(data.data);
            } else {
              console.warn(`没有${msg}消息的函数`);
            }
          }
        } else {
          debugger;
        }
      };
    }
    _initChromeRuntimeConnect();
    window.addEventListener(
      "message",
      (event) => {
        console.log("on vue:" + JSON.stringify(event));
      },
      false
    );
    Bus.on(BusMsg.ShowPlace, (data: EngineData) => {
      console.log(data);
      _expand(data.engineUUID);
    });
    Bus.on(BusMsg.RequestObjectData, (data: ObjectData, cb: Function) => {
      if (!data.id || requestList.find((el) => el.id === data.id)) {
        return;
      }
      requestList.push({ id: data.id, cb });
      bridge.send(Msg.GetObjectItemData, data);
    });
    Bus.on(BusMsg.UpdateSettings, () => {
      syncSettings();
    });
    Bus.on(BusMsg.LogData, (data: string[]) => {
      bridge.send(Msg.LogData, data);
    });
    onMounted(() => {
      syncSettings();
    });
    const treeData = ref<TreeData[]>([]);
    const expandedKeys = ref<Array<string>>([]);
    const memory = ref<{
      performance: {
        jsHeapSizeLimit?: number;
        totalJSHeapSize?: number;
        usedJSHeapSize?: number;
      };
      console: Object;
    }>({
      performance: {},
      console: {},
    });
    // el-tree的渲染key
    const defaultProps = ref<{ children: string; label: string }>({
      children: "children",
      label: "name",
    });
    const filterText = ref<string>("");
    watch(filterText, (val) => {
      // TODO: 过滤树
      updateFilterText(val);
    });

    const matchCase = ref<boolean>(false);

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
    let timerID: NodeJS.Timer | null = null;

    function _clearTimer() {
      if (timerID !== null) {
        clearInterval(timerID);
        timerID = null;
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
    function updateNodeInfo() {
      if (selectedUUID) {
        bridge.send(Msg.NodeInfo, selectedUUID);
      }
    }
    let selectedUUID: string | null = null;
    function updateFilterText(val: any) {
      (elTree.value as any)?.filter(val);
    }
    function onBtnClickUpdateTree() {
      const id = toRaw(frameID.value);
      bridge.send(Msg.TreeInfo, id);
    }
    function onChangeFrame() {
      const id = Number(toRaw(frameID.value));
      bridge.send(Msg.UseFrame, id);
    }
    const elLeft = ref<HTMLDivElement>();
    const version = ref(PluginConfig.manifest.version);
    return {
      version,
      buttonGroup,
      elTree,
      memory,
      defaultProps,
      filterText,
      matchCase,
      iframes,
      isShowDebug,
      expandedKeys,
      treeData,
      treeItemData,
      frameID,
      testValidGame(b: boolean) {
        isShowDebug.value = !!b;
      },
      getFramesData(): Option[] {
        const frames: FrameInfo[] = toRaw(iframes.value);
        const options: Option[] = [];
        frames.forEach((frame) => {
          options.push({
            label: frame.label,
            value: frame.value,
          });
        });
        return options;
      },
      onChangeCase() {
        matchCase.value = !matchCase.value;
        updateFilterText(filterText);
      },
      handleNodeClick(data: TreeData | null) {
        if (data) {
          selectedUUID = data.id;
          updateNodeInfo();
        } else {
          selectedUUID = null;
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

      onBtnClickUpdatePage() {
        bridge.send(Msg.Support);
      },
      onMemoryTest() {
        bridge.send(Msg.MemoryInfo);
      },

      onChangeFrame,
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
    };
  },
});
</script>

<style scoped lang="less">
#devtools {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-color: #5c5c5c;
  color: white;

  .head {
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 2px 0;
    border-bottom: solid 1px grey;

    .label {
      color: white;
      font-size: 12px;
      margin: 0 3px;
      margin-right: 5px;
      user-select: none;
    }
  }

  .no-find {
    display: flex;
    flex: 1;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    user-select: none;

    span {
      margin-right: 20px;
      color: white;
      font-size: 20px;
      user-select: none;
    }

    .fresh {
      cursor: pointer;
      color: white;
      font-size: 20px;

      &:hover {
        color: #cef57b;
      }

      &:active {
        color: #ffaa00;
      }
    }
  }

  .find {
    display: flex;
    flex: 1;
    flex-direction: row;
    overflow: auto;

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

    .right {
      flex: 1;
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
  }
}
</style>
