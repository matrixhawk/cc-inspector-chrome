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
                   ref="tree"
                   style="display: inline-block;"
                   :props="defaultProps"
                   :highlight-current="true"
                   :default-expand-all="false"
                   :default-expanded-keys="expandedKeys"
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
      <div class="right">
        <properties :all-group="treeItemData"></properties>
      </div>
    </div>
    <div v-show="!isShowDebug" class="no-find">
      <span>未发现cocos creator的游戏!</span>
      <el-button type="success" class="el-icon-refresh" @click="onBtnClickUpdatePage">刷新</el-button>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import {Component} from "vue-property-decorator";
import properties from "./propertys.vue";
import {Msg, Page, PluginEvent} from "@/core/types"
import {connectBackground} from "@/devtools/connectBackground";
import {EngineData, Info, TreeData, ObjectData, ObjectItemRequestData} from "@/devtools/data";
import Bus, {BusMsg} from "@/devtools/bus";

@Component({
  components: {
    properties,
  }
})
export default class Index extends Vue {
  private isShowDebug: boolean = false;
  treeItemData: Array<Record<string, any>> = [];
  treeData: Array<TreeData> = []
  expandedKeys: Array<string> = [];
  selectedUUID: string | null = null;

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

  _onMsgListInfo(eventData: Array<TreeData>) {
    this.isShowDebug = true;
    if (!Array.isArray(eventData)) {
      eventData = [eventData]
    }
    this.treeData = eventData;
    if (this.selectedUUID) {
      this.$nextTick(() => {
        //@ts-ignore
        this.$refs.tree.setCurrentKey(this.selectedUUID);
        // todo 需要重新获取下node的数据
      })
    }
  }

  _onMsgNodeInfo(eventData: any) {
    this.isShowDebug = true;
    if (!Array.isArray(eventData)) {
      eventData = [eventData]
    }
    this.treeItemData = eventData;
  }

  _onMsgMemory(eventData: any) {
    this.memory = eventData;
  }

  _onMsgSupport(data: boolean) {
    this.isShowDebug = data;
    if (data) {
      // 如果节点树为空，就刷新一次
      if (this.treeData.length === 0) {
        this.onBtnClickUpdateTree();
      }
    } else {
      this._reset();
    }
  }

  _reset() {
    this.treeData = [];
    this.treeItemData = [];
  }

  _initChromeRuntimeConnect() {
    // 接收来自background.js的消息数据
    connectBackground.onBackgroundMessage((data: PluginEvent, sender: any) => {
      if (!data) {
        return;
      }
      if (data.target === Page.Devtools) {
        console.log("[Devtools]", data);
        PluginEvent.finish(data);
        let eventData: any = data.data;
        switch (data.msg) {
          case Msg.TreeInfo: {
            this._onMsgListInfo(eventData as Array<TreeData>);
            break;
          }
          case Msg.Support: {
            this._onMsgSupport(!!eventData)
            break;
          }
          case Msg.NodeInfo: {
            this._onMsgNodeInfo(eventData);
            break;
          }
          case  Msg.MemoryInfo: {
            this._onMsgMemory(eventData)
            break;
          }
          case Msg.UpdateProperty: {
            this._updateProperty(eventData)
            break;
          }
          case Msg.TabsInfo: {
            debugger
            break
          }
          case Msg.GetObjectItemData: {
            let eventData: ObjectItemRequestData = data.data as ObjectItemRequestData;
            if (eventData.id !== null) {
              let findIndex = this.requestList.findIndex(el => el.id === eventData.id)
              if (findIndex > -1) {
                let del = this.requestList.splice(findIndex, 1)[0];
                del.cb(eventData.data);
              }
            }
            break
          }
        }
      }
    });
  }

  _updateProperty(data: Info) {
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
    let uuid = data.uuid;
    if (uuid !== undefined) {
      this.sendMsgToContentScript(Msg.NodeInfo, uuid);
    }
  }

  onChangeWatchState() {
    if (this.watchEveryTime) {
      this.timerID = setInterval(() => {
        this.onBtnClickUpdateTree();
        if (this.selectedUUID) {
          this.sendMsgToContentScript(Msg.NodeInfo, this.selectedUUID);
        }
      }, 300);
    } else {
      clearInterval(this.timerID);
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
    this.sendMsgToContentScript(Msg.TreeInfo);
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
    overflow: hidden;

    .left {
      display: flex;
      flex-direction: column;

      .tool-btn {
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
        width: 300px;

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
      overflow-y: auto;

      &::-webkit-scrollbar {
        width: 0;
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
