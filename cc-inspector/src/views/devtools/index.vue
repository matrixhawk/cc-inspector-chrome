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
      <Hierarchy></Hierarchy>
      <CCDivider></CCDivider>
      <Inspector></Inspector>
    </div>
    <Find v-if="!isShowDebug"></Find>
    <CCDialog></CCDialog>
    <CCFootBar :version="version"></CCFootBar>
  </div>
</template>

<script lang="ts">
import ccui from "@xuyanfeng/cc-ui";
import { Option } from "@xuyanfeng/cc-ui/types/cc-select/const";
import { storeToRefs } from "pinia";
import { defineComponent, ref, toRaw } from "vue";
import PluginConfig from "../../../cc-plugin.config";
import { Msg, RequestLogData, RequestUseFrameData, ResponseSupportData } from "../../core/types";
import { bridge } from "./bridge";
import { Bus, BusMsg } from "./bus";
import { FrameDetails, NodeInfoData, TreeData } from "./data";
import Find from "./find.vue";
import Hierarchy from "./hierarchy.vue";
import Inspector from "./inspector.vue";
import { appStore } from "./store";
import Test from "./test/test.vue";
import Properties from "./ui/propertys.vue";
import SettingsVue from "./ui/settings.vue";
const { CCTree, CCFootBar, CCDialog, CCInput, CCButton, CCInputNumber, CCSelect, CCButtonGroup, CCCheckBox, CCColor, CCDivider } = ccui.components;
interface FrameInfo {
  label: string;
  value: number;
}

export default defineComponent({
  components: { Find, Inspector, Hierarchy, Test, CCFootBar, CCDialog, CCTree, CCDivider, CCButtonGroup, Properties, SettingsVue, CCInput, CCButton, CCInputNumber, CCSelect, CCCheckBox, CCColor },
  name: "devtools",
  props: {},
  setup(props, ctx) {
    appStore().init();
    const isShowDebug = ref<boolean>(false);
    const iframes = ref<Array<FrameInfo>>([]);
    const { config, frameID } = storeToRefs(appStore());

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

    bridge.on(Msg.ResponseTreeInfo, (data: Array<TreeData>) => {
      isShowDebug.value = true;
    });
    bridge.on(Msg.ResponseSupport, (data: ResponseSupportData) => {
      const isCocosGame: boolean = data.support;
      isShowDebug.value = isCocosGame;
    });
    bridge.on(Msg.ResponseNodeInfo, (eventData: NodeInfoData) => {
      isShowDebug.value = true;
    });
    bridge.on(Msg.MemoryInfo, (eventData: any) => {
      memory.value = eventData;
    });
    bridge.on(Msg.ResponseUpdateFrames, (resFrames: FrameDetails[]) => {
      iframes.value = resFrames.map((item) => {
        return {
          label: item.url,
          value: item.frameID,
        };
      });

      // 第一次获取到frame配置后，自动获取frame数据
      if (frameID === null && iframes.value.length > 0 && !iframes.value.find((el) => el.value === frameID.value)) {
        frameID.value = iframes[0].value;
        onChangeFrame();
      }
    });

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

    function onChangeFrame() {
      const id = Number(toRaw(frameID.value));
      bridge.send(Msg.RequestUseFrame, { id } as RequestUseFrameData);
    }
    const elLeft = ref<HTMLDivElement>();
    const version = ref(PluginConfig.manifest.version);
    return {
      version,
      memory,
      defaultProps,
      frameID,
      iframes,
      isShowDebug,
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

      onMemoryTest() {
        bridge.send(Msg.MemoryInfo);
      },

      onChangeFrame,
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

  .find {
    display: flex;
    flex: 1;
    flex-direction: row;
    overflow: auto;
  }
}
</style>
