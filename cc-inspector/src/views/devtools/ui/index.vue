<template>
  <div id="devtools">
    <el-drawer
        title="settings"
        direction="btt"
        @close="onCloseSettings"
        :visible.sync="showSettings">
      <div>
        <settings-vue></settings-vue>
      </div>
    </el-drawer>
    <div class="head" v-show="iframes.length>1">
      <div class="label">inspect target:</div>
      <el-select v-model="frameID" placeholder="please select ..." @change="onChangeFrame" style="flex:1;">
        <el-option v-for="item in iframes" :key="item.value" :label="item.label" :value="item.value">
        </el-option>
      </el-select>
    </div>
    <div v-show="isShowDebug" class="find">
      <div v-if="false">
        <el-button type="success" @click="onMemoryTest">内存测试</el-button>
      </div>
      <div v-if="false">
        <span>JS堆栈限制: {{ memory.performance.jsHeapSizeLimit }}</span>
        <span>JS堆栈大小: {{ memory.performance.totalJSHeapSize }}</span>
        <span>JS堆栈使用: {{ memory.performance.usedJSHeapSize }}</span>
      </div>
      <div ref="left" class="left">
        <div class="tool-btn">
          <div style="padding-left: 15px;flex:1;">Node Tree</div>
          <el-button v-show="isShowRefreshBtn" type="success" class="el-icon-refresh"
                     size="mini"
                     @click="onBtnClickUpdateTree"></el-button>
          <el-button @click="onClickSettings" class="el-icon-s-tools"></el-button>
        </div>
        <el-input placeholder="enter keywords to filter" v-model="filterText">
          <template slot="append">
            <div class="matchCase ">
              <div class="iconfont el-icon-third-font-size" @click.stop="onChangeCase"
                   title="match case"
                   :style="{'color':matchCase?'red':''}">
              </div>
            </div>
          </template>
        </el-input>
        <div class="treeList">
          <el-tree :data="treeData"
                   ref="tree"
                   style="display: inline-block;"
                   :props="defaultProps"
                   :highlight-current="true"
                   :default-expand-all="false"
                   :default-expanded-keys="expandedKeys"
                   :filter-node-method="filterNode"
                   :expand-on-click-node="false"
                   node-key="uuid"
                   @node-expand="onNodeExpand"
                   @node-collapse="onNodeCollapse"
                   @node-click="handleNodeClick">
            <!--                   :render-content="renderContent"-->

            <span slot-scope="{node,data}" class="leaf" :class="data.active?'leaf-show':'leaf-hide'">
              <span>{{ node.label }}</span>
              <!--              <el-button v-if="!!data||true"> 显示</el-button>-->
            </span>
          </el-tree>
        </div>
      </div>
      <ui-divider ref="divider" @move="onDividerMove"></ui-divider>
      <div ref="right" class="right">
        <properties v-if="treeItemData" :data="treeItemData"></properties>
      </div>
    </div>
    <div v-show="!isShowDebug" class="no-find">
      <span>No games created by cocos creator found!</span>
      <el-button type="success" class="el-icon-refresh" @click="onBtnClickUpdatePage">刷新</el-button>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import {Component, Watch} from "vue-property-decorator";
import properties from "./propertys.vue";
import {Msg, Page, PluginEvent} from "@/core/types"
import {connectBackground} from "@/devtools/connectBackground";
import {
  EngineData,
  FrameDetails,
  Info,
  NodeInfoData,
  ObjectData,
  ObjectItemRequestData,
  TreeData
} from "@/devtools/data";
import Bus, {BusMsg} from "@/devtools/bus";
import settingsVue from "./settings.vue"
import {RefreshAuto, RefreshManual, settings} from "@/devtools/settings";
import UiDivider from "@/devtools/ui/ui-divider.vue";

@Component({
  components: {
    UiDivider,
    properties,
    settingsVue,
  }
})
export default class Index extends Vue {
  private isShowDebug: boolean = false;
  treeItemData: NodeInfoData | null = null;
  treeData: Array<TreeData> = []
  expandedKeys: Array<string> = [];
  selectedUUID: string | null = null;

  filterText: string | null = null;

  iframes: Array<{ label: string, value: number }> = []
  frameID: number | null = null;

  @Watch("filterText")
  updateFilterText(val: any) {
    (this.$refs?.tree as any)?.filter(val);
  }

  private matchCase = false;

  onChangeCase() {
    this.matchCase = !this.matchCase;
    this.updateFilterText(this.filterText);
  }

  private showSettings = false;

  onClickSettings() {
    this.showSettings = true;
  }

  onDividerMove(event: MouseEvent) {
    const leftDiv: HTMLDivElement = this.$refs.left as HTMLDivElement;
    if (leftDiv) {
      let width = leftDiv.clientWidth;
      width += event.movementX;
      if (width >= 300 && width < document.body.clientWidth - 100) {
        leftDiv.style.width = `${width}px`;
      }
    }
  }


  private syncSettings() {
    if (settings.data) {
      const {refreshType, refreshTime} = settings.data;
      switch (refreshType) {
        case RefreshAuto: {
          this.isShowRefreshBtn = false;
          this.onEnableTreeWatch(true, refreshTime)
          break;
        }
        case RefreshManual: {
          this.isShowRefreshBtn = true;
          this.onEnableTreeWatch(false)
        }
      }
    }
  }

  private isShowRefreshBtn = false;

  onCloseSettings() {
    this.syncSettings();
  }

  // el-tree的渲染key
  defaultProps = {
    children: "children",
    label: "name"
  };
  memory = {
    performance: {},
    console: {},
  }
  timerID: number | null = null;


  private requestList: Array<{ id: string, cb: Function }> = [];

  created() {
    if (chrome && chrome.runtime) {
      this._initChromeRuntimeConnect();
    }

    window.addEventListener("message", function (event) {
      console.log("on vue:" + JSON.stringify(event));
    }, false);
    Bus.$on(BusMsg.ShowPlace, (data: EngineData) => {
      console.log(data)
      this._expand(data.engineUUID);
    })
    Bus.$on(BusMsg.RequestObjectData, (data: ObjectData, cb: Function) => {
      if (!data.id || this.requestList.find(el => el.id === data.id)) {
        return
      }
      this.requestList.push({id: data.id, cb});
      this.sendMsgToContentScript(Msg.GetObjectItemData, data)
    });
    Bus.$on(BusMsg.LogData, (data: string[]) => {
      this.sendMsgToContentScript(Msg.LogData, data);
    })
  }

  filterNode(value: any, data: any) {
    if (!value) {
      return true;
    } else {
      if (this.matchCase) {
        // 严格匹配大写
        return data?.name?.indexOf(value) !== -1;
      } else {
        return data?.name?.toLowerCase().indexOf(value.toLowerCase()) !== -1;
      }
    }
  }

  onChangeFrame() {
    this.sendMsgToContentScript(Msg.UseFrame, this.frameID)
  }

  _expand(uuid: string) {

    let expandKeys: Array<string> = [];

    function circle(array: any) {
      for (let i = 0; i < array.length; i++) {
        let item = array[i];
        expandKeys.push(item.uuid);
        if (item.uuid === uuid) {
          return true
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

    circle(this.treeData)

    expandKeys.forEach(key => {
      if (!this.expandedKeys.find(el => el === key)) {
        this.expandedKeys.push(key)
      }
    })
    // 高亮uuid

  }

  renderContent(h: Function, options: any) {
    let {node, data, store} = options;
    return h("span", {class: ""}, data.name)
    // return(<span>1111</span>)
  }

  _onMsgTreeInfo(treeData: Array<TreeData>) {
    this.isShowDebug = true;
    if (!Array.isArray(treeData)) {
      treeData = [treeData]
    }
    this.treeData = treeData;
    if (this._checkSelectedUUID()) {
      this.updateNodeInfo();
      this.$nextTick(() => {
        //@ts-ignore
        this.$refs.tree.setCurrentKey(this.selectedUUID);
      })
    }
  }

  _checkSelectedUUID() {
    if (this.selectedUUID) {
      const b = this._findUuidInTree(this.treeData, this.selectedUUID)
      if (b) {
        return true;
      }
    }
    this.selectedUUID = null;
    this.treeItemData = null;
    return false;
  }

  _findUuidInTree(data: TreeData[], targetUUID: string) {

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

    return circle(data)
  }

  _onMsgNodeInfo(eventData: NodeInfoData) {
    this.isShowDebug = true;
    this.treeItemData = eventData;
  }

  _onMsgMemoryInfo(eventData: any) {
    this.memory = eventData;
  }

  _onMsgSupport(isCocosGame: boolean) {
    this.isShowDebug = isCocosGame;
    if (isCocosGame) {
      this.syncSettings();
      this.onBtnClickUpdateTree();
    } else {
      this._clearTimer();
      this.treeData = [];
      this.treeItemData = null;
      this.selectedUUID = null;
    }
  }

  mounted() {
    this.syncSettings();
  }

  _initChromeRuntimeConnect() {
    const msgFunctionMap: Record<string, Function> = {};
    msgFunctionMap[Msg.TreeInfo] = this._onMsgTreeInfo;
    msgFunctionMap[Msg.Support] = this._onMsgSupport;
    msgFunctionMap[Msg.NodeInfo] = this._onMsgNodeInfo;
    msgFunctionMap[Msg.MemoryInfo] = this._onMsgMemoryInfo;
    msgFunctionMap[Msg.UpdateProperty] = this._onMsgUpdateProperty;
    msgFunctionMap[Msg.UpdateFrames] = this._onMsgUpdateFrames;
    msgFunctionMap[Msg.GetObjectItemData] = this._onMsgGetObjectItemData;
    // 接收来自background.js的消息数据
    connectBackground.onBackgroundMessage((data: PluginEvent, sender: any) => {
      if (!data) {
        return;
      }
      if (data.target === Page.Devtools) {
        console.log("[Devtools]", data);
        PluginEvent.finish(data);
        const {msg} = data;
        if (msg) {
          const func = msgFunctionMap[msg];
          if (func) {
            func(data.data)
          } else {
            console.warn(`没有${msg}消息的函数`)
          }
        }
      }
    });
  }

  _onMsgGetObjectItemData(requestData: ObjectItemRequestData) {
    if (requestData.id !== null) {
      let findIndex = this.requestList.findIndex(el => el.id === requestData.id)
      if (findIndex > -1) {
        let del = this.requestList.splice(findIndex, 1)[0];
        del.cb(requestData.data);
      }
    }
  }

  _onMsgUpdateFrames(details: FrameDetails[]) {
    // 先把iframes里面无效的清空了
    this.iframes = this.iframes.filter(item => {
      details.find(el => el.frameID === item.value)
    })

    // 同步配置
    details.forEach(item => {
      let findItem = this.iframes.find(el => el.value === item.frameID);
      if (findItem) {
        findItem.label = item.url;
      } else {
        this.iframes.push({
          label: item.url,
          value: item.frameID,
        })
      }
    })
    // 第一次获取到frame配置后，自动获取frame数据
    if (this.frameID === null && this.iframes.length > 0 && !this.iframes.find(el => el.value === this.frameID)) {
      this.frameID = this.iframes[0].value;
      this.onChangeFrame();
    }
  }

  _onMsgUpdateProperty(data: Info) {
    const uuid = data.path[0];
    const key = data.path[1];
    const value = data.data;
    let treeArray: Array<TreeData> = [];

    function circle(array: Array<TreeData>) {
      array.forEach(item => {
        treeArray.push(item);
        circle(item.children);
      })
    }

    // 更新指定uuid节点的tree的name
    circle(this.treeData)
    let ret = treeArray.find(el => el.uuid === uuid);
    if (ret) {
      if (key === "name") {
        ret.name = value;
      }
      if (key === "active") {
        ret.active = !!value;
      }
    }
  }

  handleNodeClick(data: TreeData) {
    this.selectedUUID = data.uuid;
    this.updateNodeInfo();
  }

  private updateNodeInfo() {
    if (this.selectedUUID) {
      this.sendMsgToContentScript(Msg.NodeInfo, this.selectedUUID);
    }
  }

  onEnableTreeWatch(watch: boolean, time = 300) {
    if (watch) {
      this._clearTimer();
      this.timerID = setInterval(() => {
        this.onBtnClickUpdateTree();
      }, time);
    } else {
      this._clearTimer();
    }
  }

  private _clearTimer() {
    if (this.timerID !== null) {
      clearInterval(this.timerID);
      this.timerID = null;
    }
  }

  sendMsgToContentScript(msg: Msg, data?: any) {
    if (!chrome || !chrome.devtools) {
      console.log("环境异常，无法执行函数");
      return;
    }
    connectBackground.postMessageToBackground(msg, data);
  }

  // 问题：没有上下文的权限，只能操作DOM
  _executeScript(para: Object) {
    let tabID = chrome.devtools.inspectedWindow.tabId;
    //@ts-ignore
    chrome.tabs.executeScript(tabID, {code: `var CCInspectorPara='${JSON.stringify(para)}';`}, () => {
      //@ts-ignore
      chrome.tabs.executeScript(tabID, {file: "js/execute.js"})
    });
  }

  _inspectedCode() {
    let injectCode = "";
    chrome.devtools.inspectedWindow.eval(injectCode, (result, isException) => {
      if (isException) {
        console.error(isException);
      } else {
        console.log(`执行结果：${result}`)
      }
    });
  }

  onBtnClickUpdateTree() {
    this.sendMsgToContentScript(Msg.TreeInfo, this.frameID);
  }

  onBtnClickUpdatePage() {
    this.sendMsgToContentScript(Msg.Support);
  }

  onMemoryTest() {
    this.sendMsgToContentScript(Msg.MemoryInfo);
  }

  onNodeExpand(data: TreeData) {
    if (data.hasOwnProperty("uuid") && data.uuid) {
      this.expandedKeys.push(data.uuid)
    }
  }

  onNodeCollapse(data: TreeData) {
    if (data.hasOwnProperty("uuid")) {
      let index = this.expandedKeys.findIndex(el => el === data.uuid);
      if (index !== -1) {
        this.expandedKeys.splice(index, 1)
      }
    }
  }
}
</script>

<style scoped lang="less">
@import "../../index.less";

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
      background: #e5e9f2;
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
