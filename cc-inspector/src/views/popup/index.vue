<template>
  <div class="popup">
    <div class="head">
      <div class="name">{{ title }}</div>
      <div style="flex: 1"></div>
      <CCButton @click="onClickOptions">
        <i class="iconfont icon_settings"></i>
      </CCButton>
    </div>

    <div class="wechat">
      <div class="money">
        <img class="png" src="./res/money.png" alt="" />
        <div class="tips">请我喝杯奶茶</div>
      </div>
      <div class="space"></div>
      <div class="friends">
        <img class="png" src="./res/friend.png" alt="" />
        <div class="tips">交个朋友</div>
      </div>
    </div>

    <div class="foot">
      <a href="https://tidys.gitee.io/doc/#" target="_blank">
        <img class="icon" src="./res/tiezi.png" alt="" />
      </a>
      <a
        href="https://github.com/tidys/CocosCreatorPlugins/tree/master/CocosCreatorInspector"
        target="_blank"
      >
        <img class="icon" src="./res/github.png" alt="" />
      </a>
      <a href="https://jq.qq.com/?_wv=1027&k=5SdPdy2" target="_blank">
        <img class="icon" src="./res/qq.png" alt="" />
      </a>
      <div class="space"></div>
      <div v-if="version">ver:{{ version }}</div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, onMounted, ref, provide, nextTick } from "vue";
import CCP from "cc-plugin/src/ccp/entry-render";
import { ChromeConst } from "cc-plugin/src/chrome/const";
import ccui from "@xuyanfeng/cc-ui";
const { CCInput, CCButton, CCInputNumber, CCSelect, CCCheckBox, CCColor } =
  ccui.components;
export default defineComponent({
  name: "popup",
  components: {
    CCInput,
    CCButton,
    CCInputNumber,
    CCSelect,
    CCCheckBox,
    CCColor,
  },
  setup(props, ctx) {
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
    onMounted(() => {
      _initLongConn();
    });
    return {
      title,
      version,
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
.popup {
  width: 300px;
  display: flex;
  flex-direction: column;
  padding: 10px;

  .head {
    display: flex;
    flex-direction: row;
    align-items: center;

    .name {
      user-select: none;
      font-size: 18px;
      font-weight: bold;
    }
  }

  .wechat {
    margin: 10px 0;
    display: flex;
    flex-direction: row;

    .space {
      flex: 1;
    }

    .png {
      width: auto;
      height: 130px;
    }

    .tips {
      font-size: 15px;
      user-select: none;
      text-align: center;
      width: 100%;
      color: #6d6d6d;
    }
  }

  .foot {
    display: flex;
    flex-direction: row;
    height: 30px;
    align-items: center;

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
