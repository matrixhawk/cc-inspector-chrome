<template>
  <div id="devtools">
    <Test v-if="false"> </Test>
    <div class="head" v-show="iframes.length > 1">
      <div class="label">inspect target:</div>
      <CCSelect v-model:value="frameID" @change="onChangeFrame" :data="getFramesData()"> </CCSelect>
    </div>
    <div v-if="isShowDebug" class="find">
      <Hierarchy></Hierarchy>
      <CCDivider></CCDivider>
      <Inspector></Inspector>
    </div>
    <Find v-if="!isShowDebug"></Find>
    <CCDialog></CCDialog>
    <CCMenu></CCMenu>
    <CCFootBar :version="version" :hint-key="hint"></CCFootBar>
  </div>
</template>

<script lang="ts">
import ccui from "@xuyanfeng/cc-ui";
import { Option } from "@xuyanfeng/cc-ui/types/cc-select/const";
import { storeToRefs } from "pinia";
import { defineComponent, onMounted, onUnmounted, ref, toRaw } from "vue";
import PluginConfig from "../../../cc-plugin.config";
import { Msg, Page, PluginEvent, RequestUseFrameData, ResponseSupportData, ResponseUseFrameData } from "../../core/types";
import { ga } from "../../ga";
import { GA_Button } from "../../ga/type";
import { bridge } from "./bridge";
import { Bus, BusMsg } from "./bus";
import { FrameDetails, NodeInfoData, TreeData } from "./data";
import Everything from "./everything.vue";
import Find from "./find.vue";
import Hierarchy from "./hierarchy.vue";
import Inspector from "./inspector.vue";
import { appStore } from "./store";
import Test from "./test/test.vue";
import { Timer } from "./timer";
import Properties from "./ui/propertys.vue";
import SettingsVue from "./ui/settings.vue";
import { checkSupport } from "./util";
import { DialogOptions, DialogUrlData } from "@xuyanfeng/cc-ui/types/cc-dialog/const";
const { CCTree, CCFootBar, CCMenu, CCDialog, CCInput, CCButton, CCInputNumber, CCSelect, CCButtonGroup, CCCheckBox, CCColor, CCDivider } = ccui.components;
interface FrameInfo {
  label: string;
  value: number;
}

export default defineComponent({
  components: { Find, Inspector, CCMenu, Hierarchy, Test, CCFootBar, CCDialog, CCTree, CCDivider, CCButtonGroup, Properties, SettingsVue, CCInput, CCButton, CCInputNumber, CCSelect, CCCheckBox, CCColor },
  name: "devtools",
  props: {},
  setup(props, ctx) {
    ga.openView(Page.Devtools);
    appStore().init();
    const isShowDebug = ref<boolean>(false);
    const iframes = ref<Array<FrameInfo>>([]);
    const { config, frameID } = storeToRefs(appStore());
    const timer = new Timer();
    timer.onWork = () => {
      checkSupport();
    };
    timer.name = "devtools";
    onMounted(() => {
      const zh = !!navigator.language.startsWith("zh");
      const tips: string[] = zh
        ? [
            "在层级中按空格快速控制显示和隐藏节点", //
            "如果遇到任何问题，欢迎联系我",
            "在游戏界面快速拾取节点（Inspect Game），可以快速在节点树中定位",
            "打开QQ频道，全球的cocoser，web在线交流",
          ]
        : [
            "Press space in the hierarchy to quickly control the display and hiding of nodes", //
            "If you encounter any problems during use, please feel free to contact me",
          ];
      ccui.footbar.showTipsArray({ tips });
      ccui.footbar.registerCmd({
        icon: "github",
        cb: () => {
          window.open("https://github.com/tidys/cc-inspector-chrome");
          ga.clickButton(GA_Button.Github);
        },
      });
      ccui.footbar.registerCmd({
        icon: "qq",
        title: "加入QQ群，一起吐槽唠嗑",
        cb: () => {
          window.open("http://qm.qq.com/cgi-bin/qm/qr?_wv=1027&k=Bb-7s7qr2C30Ys8HTkni5wnuyxw6UoDA&authKey=M5yO2j0bTRHo1e8tlTU%2FGMGya1gW03ZhRbApZBkycwnXMxpDzwibWaJtrXZyxXYl&noverify=0&group_code=591101717");
          ga.clickButton(GA_Button.QQ);
        },
      });
      ccui.footbar.registerCmd({
        icon: "qqpd",
        title: "加入QQ频道，一起在线聊天，认识更多的Cocoser！",
        cb: () => {
          window.open("https://pd.qq.com/s/fp18mz50l");
          ga.clickButton(GA_Button.QQ);
        },
      });
      ccui.footbar.registerCmd({
        icon: "book",
        title: "插件完整功能介绍(Gif动画)",
        cb: () => {
          ga.clickButton(GA_Button.Docs);
          window.open("https://juejin.cn/post/7463836172559024179");
        },
      });
      ccui.footbar.registerCmd({
        icon: "support",
        cb: () => {
          window.open("https://github.com/tidys/cc-inspector-chrome/issues");
          ga.clickButton(GA_Button.Issues);
        },
      });
      Bus.on(BusMsg.EnableSchedule, funcEnableSchedule);
      timer.create(true);
    });
    onUnmounted(() => {
      Bus.off(BusMsg.EnableSchedule, funcEnableSchedule);
      timer.clean();
    });
    // 问题：没有上下文的权限，只能操作DOM
    function _executeScript(para: Object) {
      // chrome.tabs.executeScript()//v2版本使用的函数
      const tabID = chrome.devtools.inspectedWindow.tabId;
      chrome.scripting.executeScript({ files: ["js/execute.js"], target: { tabId: tabID } }, (results: chrome.scripting.InjectionResult[]) => {});
    }

    const funcEnableSchedule = (b: boolean) => {
      if (b) {
        timer.create();
      } else {
        timer.clean();
      }
    };
    bridge.on(Msg.ResponseTreeInfo, (event: PluginEvent) => {
      let data: Array<TreeData> = event.data;
      isShowDebug.value = true;
    });
    bridge.on(Msg.ResponseBuyEverything, (event: PluginEvent) => {
      // ccui.dialog.showDialog({
      //   comp: Everything,
      //   title: "提示",
      // });
      const data = new ccui.dialog.DialogUrlData();
      data.label = "该功能需要{everything}插件支持，请在creator中安装插件后重试。";
      data.jump = 0;
      data.url = "https://store.cocos.com/app/detail/7391";
      const opts: DialogOptions = {
        data,
        title: "提示",
        width: 180,
        height: 100,
      };
      ccui.dialog.showDialog(opts);
    });
    bridge.on(Msg.DevtoolConnectError, (event: PluginEvent) => {
      const msg = event.data;
      ccui.footbar.showError(`Devtools connect error:\n${msg}`);
    });
    bridge.on(Msg.ResponseSupport, (event: PluginEvent) => {
      let data: ResponseSupportData = event.data;
      const isCocosGame: boolean = data.support;
      isShowDebug.value = isCocosGame;
    });
    bridge.on(Msg.ResponseUseFrame, (event: PluginEvent) => {
      const data: ResponseUseFrameData = event.data;
      frameID.value = data.id;
    });
    bridge.on(Msg.ResponseNodeInfo, (event: PluginEvent) => {
      let eventData: NodeInfoData = event.data;
      isShowDebug.value = true;
    });
    bridge.on(Msg.ResponseError, (event: PluginEvent) => {
      const err: string = event.data;
      ccui.footbar.showError(err);
    });
    bridge.on(Msg.ResponseUpdateFrames, (event: PluginEvent) => {
      let resFrames: FrameDetails[] = event.data;
      iframes.value = resFrames.map((item) => {
        return {
          label: item.url,
          value: item.frameID,
        };
      });
    });

    // el-tree的渲染key
    const defaultProps = ref<{ children: string; label: string }>({
      children: "children",
      label: "name",
    });

    function onChangeFrame() {
      const id = Number(toRaw(frameID.value));
      bridge.send(Msg.RequestUseFrame, { id } as RequestUseFrameData);
      Bus.emit(BusMsg.ChangeContent, { id } as RequestUseFrameData);
    }
    const elLeft = ref<HTMLDivElement>();
    const version = ref(PluginConfig.manifest.version);
    const hint = ref(`${PluginConfig.manifest.name}-devtool`);
    return {
      hint,
      version,
      defaultProps,
      frameID,
      iframes,
      isShowDebug,

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
    overflow: hidden;
  }
}
</style>
