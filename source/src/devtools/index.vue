<template>
  <div id="devtools">
    <div v-show="isShowDebug" class="find">
      <div v-if="false">
        <el-button type="success" @click="onMemoryTest">内存测试</el-button>
      </div>
      <div v-if="false">
        <span>JS堆栈限制: {{ memory.performance.jsHeapSizeLimit }}</span>
        <span>JS堆栈大小: {{ memory.performance.totalJSHeapSize }}</span>
        <span>JS堆栈使用: {{ memory.performance.usedJSHeapSize }}</span>
      </div>
      <div class="left">
        <div class="tool-btn">
          <el-switch active-text="实时监控" v-model="watchEveryTime" @change="onChangeWatchState"></el-switch>
          <div class="flex1"></div>
          <el-button type="success" class="el-icon-refresh" @click="onBtnClickUpdateTree"></el-button>
        </div>
        <div class="treeList">
          <el-tree :data="treeData"
                   style="display: inline-block;"
                   :props="defaultProps"
                   :highlight-current="true"
                   :default-expand-all="false"
                   :expand-on-click-node="true"
                   @node-click="handleNodeClick"></el-tree>
        </div>
      </div>
      <div class="right">
        <NodeBaseProperty :all-group="treeItemData"></NodeBaseProperty>
      </div>
    </div>
    <div v-show="!isShowDebug" class="no-find">
      <span>未发现cocos creator的游戏!</span>
      <el-button type="success" class="el-icon-refresh" @click="onBtnClickUpdatePage">刷新</el-button>
    </div>
  </div>
</template>

<script lang="ts">
// import injectScript from '../injectScript.js'
// import EvalCode from "./evalCodeString.js";

import Vue from "vue";
import {Component, Prop} from "vue-property-decorator";
import SceneProperty from "@/devtools/ccType/SceneProperty.vue";
import ComponentsProperty from "@/devtools/ccType/ComponentsProperty.vue";
import NodeBaseProperty from "@/devtools/ccType/NodeBaseProperty.vue";

const PluginMsg = require("../core/plugin-msg");
@Component({
  components: {
    NodeBaseProperty, ComponentsProperty, SceneProperty,
  }
})
export default class Index extends Vue {
  private isShowDebug: boolean = false;
  treeItemData: Array<Record<string, any>> = [];
  treeData: Array<Record<string, any>> = []
  bgConn: chrome.runtime.Port | null = null// 与background.js的链接

  // el-tree的渲染key
  defaultProps = {
    children: "children",
    label: "name"
  };
  private watchEveryTime: boolean = false;// 实时监控节点树

  memory = {
    performance: {},
    console: {},
  }
  timerID: number = 0;

  created() {
    this.onTestData();
    if (chrome && chrome.runtime) {
      this._initChromeRuntimeConnect();
    }

    window.addEventListener("message", function (event) {
      console.log("on vue:" + JSON.stringify(event.data));
      console.log("on vue:" + JSON.stringify(event));
    }, false);
  }

  _initChromeRuntimeConnect() {
    // chrome.devtools.inspectedWindow.tabId
    // 接收来自background.js的消息数据
    this.bgConn = chrome.runtime.connect({name: PluginMsg.Page.Devtools});
    this.bgConn.onMessage.addListener((data, sender) => {
      if (!data) {
        return;
      }
      let eventData = data.data;
      let eventMsg = data.msg;
      if (eventMsg === PluginMsg.Msg.ListInfo) {
        this.isShowDebug = true;
        if (!Array.isArray(eventData)) {
          eventData = [eventData]
        }
        this.treeData = eventData;
      } else if (eventMsg === PluginMsg.Msg.Support) {
        this.isShowDebug = eventData.support;
      } else if (eventMsg === PluginMsg.Msg.NodeInfo) {
        this.isShowDebug = true;
        if (!Array.isArray(eventData)) {
          eventData = [eventData]
        }
        this.treeItemData = eventData;
      } else if (eventMsg === PluginMsg.Msg.MemoryInfo) {
        this.memory = eventData;
      }
    });
  }


  onTestData() {
    for (let i = 0; i < 40; i++) {
      this.treeData.push({name: `node${i}`, children: [{name: `children11111111111111111111111111111111111111${i}`}]})
    }
  }

  handleNodeClick(data: any) {
    // todo 去获取节点信息
    // console.log(data);
    let uuid = data.uuid;
    if (uuid !== undefined) {
      this.evalInspectorFunction("getNodeInfo", `"${uuid}"`);
    }
  }

  onChangeWatchState() {
    if (this.watchEveryTime) {
      this.timerID = setInterval(() => {
        this.onBtnClickUpdateTree();
      }, 100);
    } else {
      clearInterval(this.timerID);
    }

  }

  evalInspectorFunction(func: string, para?: string = '') {
    if (!func || func.length < 0) {
      console.log("缺失执行函数名!");
      return;
    }

    if (!chrome || !chrome.devtools) {
      console.log("环境异常，无法执行函数");
      return;
    }

    let injectCode =
        `if(window.ccinspector){
              let func = window.ccinspector.${func};
              if(func){
                console.log("执行${func}成功");
                func.apply(window.ccinspector,[${para}]);
              }else{
                console.log("未发现${func}函数");
              }
         }else{
              console.log("脚本inject.js未注入");
         }`;
    chrome.devtools.inspectedWindow.eval(injectCode, (result, isException) => {
      if (isException) {
        console.error(isException);
      } else {
        console.log(`执行结果：${result}`)
      }
    });
  }

  onBtnClickUpdateTree() {
    this.evalInspectorFunction("updateTreeInfo");
  }

  onBtnClickUpdatePage() {
    this.evalInspectorFunction("checkIsGamePage", "true");
  }

  onMemoryTest() {
    this.evalInspectorFunction("onMemoryInfo");
  }

}
</script>

<style scoped lang="less">
@import "../index.less";

#devtools {
  display: flex;
  width: 100%;
  height: 100%;

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

    .left {
      display: flex;
      flex: 1;
      flex-direction: column;

      .tool-btn {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
      }

      .treeList {
        margin-top: 3px;
        flex: 1;
        height: 100%;
        border-radius: 4px;
        min-height: 20px;
        overflow: scroll;
        width: 300px;


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
      flex: 2;
      background: #e5e9f2;
      overflow: scroll;
    }
  }
}
</style>
