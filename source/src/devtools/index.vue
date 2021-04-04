<template>
  <div id="devtools">
    <div v-show="isShowDebug" class="find">
      <div v-if="false">
        <el-button type="success" @click="onBtnClickTest1">Test1</el-button>
        <el-button type="success" @click="onBtnClickTest2">Test2</el-button>
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
        <NodeBaseProperty :item-data="treeItemData"></NodeBaseProperty>
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
  private isShowDebug: boolean = true;
  treeItemData: Record<string, any> = {};
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
        this._updateTreeView(eventData);
      } else if (eventMsg === PluginMsg.Msg.Support) {
        this.isShowDebug = eventData.support;
      } else if (eventMsg === PluginMsg.Msg.NodeInfo) {
        this.isShowDebug = true;
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

    this.treeItemData = {
      "uuid": "11",
      "name": "name",
      "type": "cc_Node",
      "height": 1080.986301369863,
      "color": "#fff85f",
      "opacity": 255,
      "components": [
        {
          "uuid": "Comp.931",
          "type": "cc_Canvas",
          "name": "Canvas<Canvas>"
        },
        {
          "uuid": "Comp.932",
          "type": "HotUpdateScene",
          "name": "Canvas<HotUpdateScene>"
        }],
      "active": true
    };
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

  _updateTreeView(data: any) {
    this.treeData = [data.scene];
    return;
    // 构建树形数据
    if (this.treeData.length === 0) {// 第一次赋值


    } else {

    }


    let treeData = [];
    debugger
    let sceneData = data.scene;
    if (sceneData) {
      // scene info
      let dataRoot = {
        type: sceneData.type, uuid: sceneData.uuid,
        label: sceneData.name, children: []
      };
      treeData.push(dataRoot);
      this.handleNodeClick(dataRoot);
      // scene children info
      for (let k in sceneData.children) {
        let itemSceneData = sceneData.children[k];
        // let sceneItem = {uuid: itemSceneData.uuid, label: itemSceneData.name, children: []};
        let sceneItem = {};
        dealChildrenNode(itemSceneData, sceneItem);
        treeData[0].children.push(sceneItem);
      }
    }
    this.treeData = treeData;

    function dealChildrenNode(rootData: any, obj: any) {
      obj["data"] = rootData;
      obj["uuid"] = rootData.uuid;
      obj["label"] = rootData.name;
      obj["type"] = rootData.type;
      obj["children"] = [];
      let rootChildren = rootData.children;
      for (let k in rootChildren) {
        let itemData = rootChildren[k];
        let item = {};
        dealChildrenNode(itemData, item);
        obj.children.push(item);
      }
    }
  }

  _getInjectScriptString() {
    let injectScript = "";
    let code = injectScript.toString();
    let array = code.split("\n");
    array.splice(0, 1);// 删除开头
    array.splice(-1, 1);// 删除结尾
    let evalCode = "";
    for (let i = 0; i < array.length; i++) {
      evalCode += array[i] + "\n";
    }
    // console.log(evalCode);
    return evalCode;
  }


  evalInspectorFunction(funcString: string, parm?: any) {
    if (funcString || funcString.length > 0) {
      let injectCode =
          `if(window.ccinspector){
              let func = window.ccinspector.${funcString};
              if(func){
                console.log("执行${funcString}成功");
                func.apply(window.ccinspector,[${parm}]);
              }else{
                console.log("未发现${funcString}函数");
              }
            }else{
              console.log("可能脚本没有注入");
            }`;
      console.log(injectCode);
      if (chrome && chrome.devtools) {
        let ret = chrome.devtools.inspectedWindow.eval(injectCode, function (result, info) {
          if (info && info.isException) {
            console.log(info.value);
          }

        });
        console.log(`ret:${ret}`);
      }
    } else {
      console.log("执行失败!");
    }
  }

  onBtnClickUpdateTree() {
    this.evalInspectorFunction("updateTreeInfo");

  }

  onBtnClickUpdatePage() {
    this.evalInspectorFunction("checkIsGamePage", "true");
    // let code = this._getInjectScriptString();
    // chrome.devtools.inspectedWindow.eval(code, function () {
    //   console.log("刷新成功!");
    // });
  }

  onBtnClickTest1() {
    chrome.devtools.inspectedWindow.eval(`window.ccinspector.testMsg1()`);
  }

  _getTime() {
    return new Date().getTime().toString();
  }

  onBtnClickTest2() {
    // chrome.devtools.inspectedWindow.eval(`window.ccinspector.testMsg2()`)


    let newData = [
      {
        name: this._getTime(),
        children: [
          {
            name: this._getTime(),
            children: [
              {
                name: this._getTime(),
              }
            ]
          },
          {
            name: this._getTime(),
          }
        ]
      }

    ];

    // this.treeData = newData;
    this._update37(this.treeData[0], newData[0]);
  }

  _update37(oldTreeNode: any, newTreeNode: any) {
    debugger
    if (!newTreeNode) {
      return;
    }
    if (!oldTreeNode) {
      oldTreeNode = {name: "", children: []};
    }
    if (oldTreeNode.name !== newTreeNode.name) {
      oldTreeNode.name = newTreeNode.name;
    }

    let oldChildren = oldTreeNode.children;
    let newChildren = newTreeNode.children;

    if (oldChildren.length === 0) {
      oldChildren = newChildren;
    } else {
      // 比较2个数据: treeData, newTreeData
      // 比较该层级的数据
      for (let i = 0; i < newChildren.length; i++) {
        let itemNew = newChildren[i];
        let itemOld = oldChildren[i];
        if (itemOld === undefined) {
          // 老节点中没有
          oldChildren.push(itemNew);
        } else if (itemNew.name !== itemOld.name) {
          // 替换
          oldChildren.splice(i, 1, itemNew);
        } else {
          this._update37(itemOld, itemNew);
        }
      }
      // 多余的删除了
      if (oldChildren.length > newChildren.length) {
        oldChildren.splice(newChildren.length, oldChildren.length - newChildren.length);
      }
    }
  }

  onBtnClickTest3() {
    // chrome.devtools.inspectedWindow.eval(`window.ccinspector.testMsg3()`)
    let f = require("../core/event-mgr");
    console.log(f.id);
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
