// content.js 和原始界面共享DOM，具有操作dom的能力
// 但是不共享js,要想访问页面js,只能通过注入的方式
import { injectScript } from "../core/util";
import { Msg, Page, PluginEvent } from "../core/types";
import { ChromeConst } from "cc-plugin/src/chrome/const";
injectScript(ChromeConst.script.inject);

class Content {
  private connect: chrome.runtime.Port | null = null;

  constructor() {
    // 接受来自inject.js的消息数据,然后中转到background.js
    window.addEventListener("message", (event) => {
      let data: PluginEvent = event.data;
      if (PluginEvent.check(data, Page.Inject, Page.Content)) {
        console.log("[Window-Message]: ", data);
        PluginEvent.reset(data, Page.Content, Page.Devtools)
        this.connect?.postMessage(data)
      }
    }, false);
  }

  // 和background.js保持长连接通讯，background和content的交互也要通过这个链接进行通讯
  private connectToBackground() {
    this.connect = chrome.runtime.connect({ name: Page.Content })
    this.connect.onMessage.addListener((data: PluginEvent, sender) => {
      if (PluginEvent.check(data, Page.Background, Page.Content)) {
        // console.log(`%c[Connect-Message] ${JSON.stringify(data)}`, "color:green;")
        console.log("[Connect-Message]: ", data);
        PluginEvent.reset(data, Page.Content, Page.Inject)
        window.postMessage(data, "*");
      }
    })
  }

  private sendMessageToBackground(data: PluginEvent) {
    if (this.connect) {
      this.connect.postMessage(data);
    }
  }

  run() {
    this.connectToBackground();
    this.checkGame();
  }

  private checkGame() {
    let gameCanvas = document.querySelector("#GameCanvas");
    if (!gameCanvas) {
      let sendData = new PluginEvent(Page.Content, Page.Devtools, Msg.Support, {
        support: false,
        msg: "未发现GameCanvas,不支持调试游戏!"
      })
      this.sendMessageToBackground(sendData)
    }
  }
}


const content = new Content();
content.run();
