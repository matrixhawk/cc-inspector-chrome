<template>
  <div id="devtools">
    <!-- <el-drawer title="settings" direction="btt" @close="onCloseSettings" :visible.sync="showSettings">
            <div>
                <SettingsVue></SettingsVue>
            </div>
        </el-drawer> -->
    <div class="head" v-show="iframes.length > 1">
      <div class="label">inspect target:</div>
      <CCSelect v-model:value="frameID" placeholder="please select ..." @change="onChangeFrame" :data="getFramesData()"> </CCSelect>
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
          <div style="padding-left: 5px; flex: 1; user-select: none">Node Tree</div>
          <CCButtonGroup :items="buttonGroup" :recover="true"></CCButtonGroup>
        </div>
        <CCInput placeholder="enter keywords to filter" :data="filterText">
          <slot>
            <i class="matchCase iconfont icon_font_size" @click.stop="onChangeCase" title="match case" :style="{ color: matchCase ? 'red' : '' }"></i>
          </slot>
        </CCInput>
        <div class="treeList">
          <CCTree></CCTree>
          <!-- <el-tree
            :data="treeData"
            ref="tree"
            style="display: inline-block"
            :props="defaultProps"
            :highlight-current="true"
            :default-expand-all="false"
            :default-expanded-keys="expandedKeys"
            :filter-node-method="filterNode"
            :expand-on-click-node="false"
            node-key="uuid"
            @node-expand="onNodeExpand"
            @node-collapse="onNodeCollapse"
            @node-click="handleNodeClick"
          >
            <span
              slot-scope="{ node, data }"
              class="leaf"
              :class="data.active ? 'leaf-show' : 'leaf-hide'"
            >
              <span>{{ node.label }}</span>
            </span>
          </el-tree> -->
        </div>
      </div>
      <CCDivider></CCDivider>
      <div class="right">
        <properties v-if="treeItemData" :data="treeItemData"></properties>
      </div>
    </div>
    <div v-show="!isShowDebug" class="no-find">
      <span>No games created by cocos creator found!</span>
      <CCButton type="success" @click="onBtnClickUpdatePage">
        <i class="iconfont icon_refresh"></i>
      </CCButton>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, PropType, ref, onMounted, watch, toRaw, nextTick } from "vue";
import properties from "./ui/propertys.vue";
import { Option } from "@xuyanfeng/cc-ui/types/cc-select/const";
import ccui from "@xuyanfeng/cc-ui";
const { CCTree, CCInput, CCButton, CCInputNumber, CCSelect, CCButtonGroup, CCCheckBox, CCColor, CCDivider } = ccui.components;
import { Msg, Page, PluginEvent } from "../../core/types";
import { connectBackground } from "./connectBackground";
import { EngineData, FrameDetails, Info, NodeInfoData, ObjectData, ObjectItemRequestData, TreeData } from "./data";
import Bus, { BusMsg } from "./bus";
import SettingsVue from "./ui/settings.vue";
import { RefreshType, settings } from "./settings";
import { ButtonGroupItem } from "@xuyanfeng/cc-ui/types/cc-button-group/const";
import { ITreeData } from "@xuyanfeng/cc-ui/types/cc-tree/const";
interface FrameInfo {
  label: string;
  value: number;
}

export default defineComponent({
  components: { CCTree, CCDivider, CCButtonGroup, properties, SettingsVue, CCInput, CCButton, CCInputNumber, CCSelect, CCCheckBox, CCColor },
  name: "devtools",
  props: {},
  setup(props, ctx) {
    const treeItemData = ref<NodeInfoData | null>({ uuid: "", group: [] });
    const showSettings = ref<boolean>(false);
    const isShowDebug = ref<boolean>(true);
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
          showSettings.value = true;
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
          if (item.uuid === targetUUID) {
            return true;
          }
          if (circle(item.children)) {
            return true;
          }
        }
        return false;
      }

      return circle(data);
    }

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

    function _onMsgNodeInfo(eventData: NodeInfoData) {
      isShowDebug.value = true;
      treeItemData.value = eventData;
    }

    function _onMsgMemoryInfo(eventData: any) {
      memory.value = eventData;
    }

    function _onMsgSupport(isCocosGame: boolean) {
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
    }
    function _onMsgGetObjectItemData(requestData: ObjectItemRequestData) {
      if (requestData.id !== null) {
        let findIndex = requestList.findIndex((el) => el.id === requestData.id);
        if (findIndex > -1) {
          let del = requestList.splice(findIndex, 1)[0];
          del.cb(requestData.data);
        }
      }
    }

    function _onMsgUpdateFrames(details: FrameDetails[]) {
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
    }

    function _onMsgUpdateProperty(data: Info) {
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
      let ret = treeArray.find((el) => el.uuid === uuid);
      if (ret) {
        if (key === "name") {
          ret.name = value;
        }
        if (key === "active") {
          ret.active = !!value;
        }
      }
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
    const elTree = ref<HTMLElement>();
    function _onMsgTreeInfo(treeData: Array<TreeData>) {
      console.log("treeData");
      isShowDebug.value = true;
      if (!Array.isArray(treeData)) {
        treeData = [treeData];
      }
      treeData = treeData;
      if (_checkSelectedUUID()) {
        updateNodeInfo();
        nextTick(() => {
          if (elTree.value) {
            //@ts-ignore
            elTree.value.setCurrentKey(selectedUUID);
          }
        });
      }
    }
    function _initChromeRuntimeConnect() {
      const msgFunctionMap: Record<string, Function> = {};
      msgFunctionMap[Msg.TreeInfo] = _onMsgTreeInfo;
      msgFunctionMap[Msg.Support] = _onMsgSupport;
      msgFunctionMap[Msg.NodeInfo] = _onMsgNodeInfo;
      msgFunctionMap[Msg.MemoryInfo] = _onMsgMemoryInfo;
      msgFunctionMap[Msg.UpdateProperty] = _onMsgUpdateProperty;
      msgFunctionMap[Msg.UpdateFrames] = _onMsgUpdateFrames;
      msgFunctionMap[Msg.GetObjectItemData] = _onMsgGetObjectItemData;
      // 接收来自background.js的消息数据
      connectBackground.onBackgroundMessage((data: PluginEvent, sender: any) => {
        if (!data) {
          return;
        }
        if (data.target === Page.Devtools) {
          console.log("[Devtools]", data);
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
        }
      });
    }
    if (chrome && chrome.runtime) {
      _initChromeRuntimeConnect();
    }

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
      connectBackground.sendMsgToContentScript(Msg.GetObjectItemData, data);
    });
    Bus.on(BusMsg.LogData, (data: string[]) => {
      connectBackground.sendMsgToContentScript(Msg.LogData, data);
    });
    onMounted(() => {
      syncSettings();
    });
    const treeData = ref<Array<TreeData>>([]);
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
      if (settings.data) {
        const { refreshType, refreshTime } = settings.data;
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
    }
    function updateNodeInfo() {
      if (selectedUUID) {
        connectBackground.sendMsgToContentScript(Msg.NodeInfo, selectedUUID);
      }
    }
    let selectedUUID: string | null = null;
    function updateFilterText(val: any) {
      (elTree.value as any)?.filter(val);
    }
    function onBtnClickUpdateTree() {
      connectBackground.sendMsgToContentScript(Msg.TreeInfo, frameID);
    }
    function onChangeFrame() {
      connectBackground.sendMsgToContentScript(Msg.UseFrame, frameID);
    }
    const elLeft = ref<HTMLDivElement>();
    return {
      buttonGroup,
      elTree,
      memory,
      defaultProps,
      filterText,
      matchCase,
      iframes,
      isShowDebug,
      showSettings,
      expandedKeys,
      treeData,
      treeItemData,
      frameID,
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
      handleNodeClick(data: TreeData) {
        selectedUUID = data.uuid;
        updateNodeInfo();
      },
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
        connectBackground.sendMsgToContentScript(Msg.Support);
      },
      onCloseSettings() {
        syncSettings();
      },

      onMemoryTest() {
        connectBackground.sendMsgToContentScript(Msg.MemoryInfo);
      },

      onChangeFrame,
      onNodeExpand(data: TreeData) {
        if (data.hasOwnProperty("uuid") && data.uuid) {
          expandedKeys.value.push(data.uuid);
        }
      },
      onNodeCollapse(data: TreeData) {
        if (data.hasOwnProperty("uuid")) {
          let index = expandedKeys.value.findIndex((el) => el === data.uuid);
          if (index !== -1) {
            expandedKeys.value.splice(index, 1);
          }
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

  .head {
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 1px 0;
    border-bottom: solid 1px grey;

    .label {
      margin: 0 3px;
    }
  }

  .no-find {
    display: flex;
    flex: 1;
    flex-direction: row;
    align-items: center;
    justify-content: center;

    span {
      margin-right: 20px;
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
      }

      .matchCase {
        width: 30px;
        height: 26px;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
      }

      .treeList {
        margin-top: 3px;
        height: 100%;
        border-radius: 4px;
        min-height: 20px;
        overflow: auto;
        width: 100%;

        .leaf {
          width: 100%;
        }

        .leaf-show {
          color: black;
        }

        .leaf-hide {
          color: #c7bbbb;
          text-decoration: line-through;
        }

        &::-webkit-scrollbar {
          width: 6px;
          height: 6px;
          background: #999;
          border-radius: 2px;
        }

        &::-webkit-scrollbar-thumb {
          background-color: #333;
          border-radius: 2px;
        }
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
