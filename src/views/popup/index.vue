<template>
  <div class="popup">
    <div class="tap">
      <CCButtonGroup :choose-item="chooseItem" color="#ffffff" :items="items"></CCButtonGroup>
    </div>
    <div v-if="isViewSupport()" class="root" style="flex-direction: column; align-items: center">
      <ol style="overflow: auto" class="ccui-scrollbar">
        <li><a :href="cocosStore" target="_blank">CocosStore打赏该插件</a></li>
        <li><a :href="myPlugins" target="_blank" @click="onClickBuyPlugins">支持作者其他插件</a></li>
        <li>
          <div style="display: flex; flex-direction: column; align-items: flex-start">
            请我喝杯咖啡
            <img style="height: 320px; margin-top: 5px; object-fit: contain" src="./res/30.jpg" alt="" />
          </div>
        </li>
      </ol>
    </div>
    <div v-if="isViewFriends()" class="root">
      <div style="overflow: auto; display: flex; flex-direction: column; align-items: center" class="ccui-scrollbar">
        <img style="height: 420px; object-fit: contain" src="./res/friend.png" alt="" />
      </div>
    </div>
    <div v-show="isViewRecommend()" class="root iconfont ccui-scrollbar" style="overflow: auto">
      <Ad></Ad>
    </div>
    <div v-if="isViewOnlineTools()" class="root">
      <div>个人开发的web在线游戏工具，无须安装，欢迎自荐，收录更多游戏开发工具。</div>
      <div style="overflow: auto; display: flex; flex: 1" class="ccui-scrollbar">
        <ol>
          <li v-for="(item, index) in onlineTools" :key="index">
            <a :href="item.store" target="_blank" class="iconfont icon_shop_cart icon"></a>
            <a :href="item.url" target="_blank" class="link" @click="onClickTry($event, item.url)"> {{ item.name }} </a>
          </li>
        </ol>
      </div>
    </div>
    <div class="foot">
      <div class="rate" @click="onClickRate">
        <img v-for="i in 5" style="width: 16px; object-fit: contain" src="./res/star.png" />
        <div style="margin-left: 3px">求五星好评</div>
      </div>
      <div class="space"></div>
      <div v-if="version">ver:{{ version }}</div>
    </div>
  </div>
</template>
<script lang="ts">
import ccui from "@xuyanfeng/cc-ui";
import { ButtonGroupItem } from "@xuyanfeng/cc-ui/types/cc-button-group/const";
import CCP from "cc-plugin/src/ccp/entry-render";
import { ChromeConst } from "cc-plugin/src/chrome/const";
import { defineComponent, onMounted, ref } from "vue";
import PKG from "../../../cc-plugin.config";
import { Page } from "../../core/types";
import { ga } from "../../ga";
import { GA_EventName } from "../../ga/type";
import Ad from "../../scripts/inject-view/ad.vue";
import { getAdData } from "../../scripts/inject-view/loader";
const { CCInput, CCButton, CCButtonGroup, CCInputNumber, CCSelect, CCCheckBox, CCColor } = ccui.components;
enum ViewType {
  Support = "support",
  Friends = "frends",
  Recommend = "recommend",
  OnlineTools = "onlineTools",
}
interface Tools {
  name: string;
  url: string;
  store: string;
}
export default defineComponent({
  name: "popup",
  components: { CCInput, CCButton, CCInputNumber, Ad, CCSelect, CCCheckBox, CCColor, CCButtonGroup },
  setup(props, ctx) {
    ga.openView(Page.Popup);
    const title = ref(CCP.manifest.name);
    const version = ref(CCP.manifest.version);
    let longConn: chrome.runtime.Port | null = null;
    function _initLongConn() {
      if (!longConn) {
        console.log("[popup] 初始化长连接");
        if (chrome && chrome.runtime) {
          longConn = chrome.runtime.connect({ name: "popup" });
          longConn.onMessage.addListener((data: any, sender: any) => {
            _onLongConnMsg(data, sender);
          });
        }
      }
    }
    function _onLongConnMsg(data: string, sender: any) {
      // console.log( title);
    }
    onMounted(async () => {
      _initLongConn();
      const data = await getAdData();
      if (data) {
        data.data.forEach((item) => {
          item.getTryInfos().forEach((info) => {
            onlineTools.value.push({
              name: info.name,
              url: info.url,
              store: item.store,
            });
          });
        });
      }
    });
    const items = ref<ButtonGroupItem[]>([
      {
        text: "在线工具",
        icon: "icon_fly",
        click: (event: MouseEvent | null, item: ButtonGroupItem) => {
          viewType.value = ViewType.OnlineTools;
          ga.fireEventWithParam(GA_EventName.Popup, item.text);
        },
      },
      {
        text: "支持我",
        icon: "icon_cocos",
        click: (event: MouseEvent | null, item: ButtonGroupItem) => {
          viewType.value = ViewType.Support;
          ga.fireEventWithParam(GA_EventName.Popup, item.text);
        },
      },
      {
        text: "加我为好友",
        icon: "icon_wechat",
        click: (event: MouseEvent | null, item: ButtonGroupItem) => {
          viewType.value = ViewType.Friends;
          ga.fireEventWithParam(GA_EventName.Popup, item.text);
        },
      },
      {
        text: "推荐",
        icon: "icon_good",
        click: (event: MouseEvent | null, item: ButtonGroupItem) => {
          viewType.value = ViewType.Recommend;
          ga.fireEventWithParam(GA_EventName.Popup, item.text);
        },
      },
    ]);
    const viewType = ref<ViewType>(ViewType.Friends);
    const onlineTools = ref<Tools[]>([]);
    const chooseItem = ref(items.value[0]);
    const cocosStore = ref(PKG.manifest.store);
    const myPlugins = ref("https://store.cocos.com/app/search?name=xu_yanfeng");
    return {
      onClickRate() {
        ga.fireEventWithParam(GA_EventName.Popup, "rate");
        window.open(PKG.manifest.chrome.url);
      },
      cocosStore,
      myPlugins,
      onClickBuyPlugins() {
        ga.fireEventWithParam(GA_EventName.Popup, myPlugins.value);
      },
      onClickTry(event: MouseEvent, url: string) {
        ga.fireEventWithParam(GA_EventName.Popup, url);
      },
      onlineTools,
      isViewSupport() {
        return viewType.value === ViewType.Support;
      },
      isViewFriends() {
        return viewType.value === ViewType.Friends;
      },
      isViewRecommend() {
        return viewType.value === ViewType.Recommend;
      },
      isViewOnlineTools() {
        return viewType.value === ViewType.OnlineTools;
      },
      items,
      title,
      version,
      chooseItem,
      onClickOptions() {
        if (chrome && chrome.tabs) {
          chrome.tabs.create({ url: ChromeConst.html.popup });
        }
      },
      onBtnClickGitHub() {
        console.log("onBtnClickGitHub");
      },
    };
  },
});
</script>
<style scoped lang="less">
@height: 500px;
@width: 400px;
.popup {
  display: flex;
  flex-direction: column;
  padding: 10px;
  max-width: @width;
  min-width: @width;
  max-height: @height;
  min-height: @height;
  overflow: hidden;
  background-color: white;
  .icon {
    cursor: pointer;
    margin-right: 5px;
    &:hover {
      color: #f9c04e;
    }
  }
  .link {
    &:hover {
      color: #3dcb00;
    }
  }
  .root {
    display: flex;
    flex: 1;
    overflow: hidden;
    flex-direction: column;
  }
  .tap {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
  }
  .foot {
    display: flex;
    flex-direction: row;
    height: 30px;
    align-items: center;
    .rate {
      display: flex;
      flex-direction: row;
      align-items: center;
      cursor: pointer;

      &:hover {
        color: #ff0000;
      }
    }
    .space {
      flex: 1;
    }

    .icon {
      margin: 0 3px;
      width: auto;
      height: 20px;
    }
  }
}
</style>
