<template>
  <div id="popup">
    <div style="display: flex;flex-direction: row;align-items: center;">
      <h3>{{ title }}</h3>
      <div style="flex: 1"></div>
      <el-button class="el-icon-setting" @click="onClickOptions"></el-button>
      <el-button @click="onMsgToBg">To-Bg</el-button>
      <el-button @click="onSendMsg">Msg</el-button>
    </div>
    <div style="text-align: center;width: 100%; color: #6d6d6d;">
      <span>支持作者</span>
    </div>
    <br/>
    <div style="margin:0 auto;width:100%;">
      <div style="width: 200px; margin: 0 auto;" v-show="isShowMoneyPng">
        <img style="width: 100%;height: auto;" src="./res/money.jpg">
      </div>
    </div>
    <br/>
    <div id="foot" style="height: 30px;">
      <span style="font-size: 14px;float: left;text-align: center;line-height: 30px;color: #6d6d6d;">联系方式:</span>
      <div style="height: 100%;float: right;margin-right: 10px;">
        <a href="https://github.com/tidys/CocosCreatorPlugins/tree/master/CocosCreatorInspector" target="_blank">
          <img src="./res/github.png" style="height: 100%;">
        </a>
      </div>
      <div style="height: 100%;float: right;margin-right: 10px;">
        <a href="https://jq.qq.com/?_wv=1027&k=5SdPdy2" target="_blank">
          <img src="./res/qq.png" style="height: 100%;">
        </a>
      </div>
      <div style="height: 100%;float: right;margin-right: 10px;">
        <a href="http://forum.cocos.com/t/chrome-creator/55669" target="_blank">
          <img src="./res/tiezi.png" style="height: 100%;">
        </a>
      </div>
    </div>
  </div>

</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";
import HelloWorld from "./HelloWorld.vue";

@Component({
  components: {
    HelloWorld,
  },
})
export default class App extends Vue {
  longConn: chrome.runtime.Port | null = null

  data() {
    return {
      title: "cc-inspector",
      isShowMoneyPng: true,
    }
  }

  created() {
    this._initLongConn();
  }

  onBtnClickGitHub() {
    console.log("onBtnClickGitHub");
  }

  onClickOptions() {
    if (chrome && chrome.tabs) {
      const manifest = require('../manifest/index')
      if (manifest.options_page) {
        chrome.tabs.create({url: manifest.options_page})
      }
    }
  }

  _initLongConn() {
    if (!this.longConn) {
      console.log("[popup] 初始化长连接");
      if (chrome && chrome.runtime) {
        this.longConn = chrome.runtime.connect({name: "popup"});
        this.longConn.onMessage.addListener((data: any, sender: any) => {
          this._onLongConnMsg(data, sender);
        })
      }
    }
  }

  _onLongConnMsg(data: string, sender: any) {
    // console.log(this.title);
  }

  onMsgToBg() {
    // 因为webpack的原因,这种方式可能拿不到里面的function, var
    // chrome.extension.getBackgroundPage();

    // 发送消息到background.js
    if (chrome && chrome.runtime) {
      chrome.runtime.sendMessage("content msg", function (data: any) {
        console.log(data);
      });
    }
  }

  onSendMsg() {
    if (this.longConn) {
      this.longConn.postMessage({send: "hello"});

    }
  }
}
</script>

<style scoped lang="less">
@import "../index.less";

#popup {
  width: auto;
}
</style>
