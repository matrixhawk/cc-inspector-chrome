// content.js 和原始界面共享DOM，具有操作dom的能力
// 但是不共享js,要想访问页面js,只能通过注入的方式
import { ChromeConst } from "cc-plugin/src/chrome/const";
import { Msg, Page, PluginEvent } from "../core/types";
import { Terminal } from "./terminal";

export function injectScript(url: string) {
  if (chrome && chrome.runtime && chrome.runtime.getURL) {
    let content = chrome.runtime.getURL(url)
    const script = document.createElement("script")
    script.setAttribute("type", "text/javascript")
    script.setAttribute("src", content)
    script.onload = function () {
      document.head.removeChild(script);
    }
    document.head.appendChild(script)
    console.log(...terminal.green(`inject script success: ${content}`));
  } else {
    console.log(...terminal.red("inject script failed"));
  }
}

const terminal = new Terminal(Page.Content);
console.log(...terminal.init());
// 和background.js保持长连接通讯，background和content的交互也要通过这个链接进行通讯
let connect: chrome.runtime.Port | null = chrome.runtime.connect({ name: Page.Content })
connect.onDisconnect.addListener(() => {
  console.log(...terminal.disconnect(""));
  connect = null
})
connect.onMessage.addListener((data: PluginEvent, sender: chrome.runtime.Port) => {
  if (PluginEvent.check(data, Page.Background, Page.Content)) {
    console.log(...terminal.message(JSON.stringify(data)));
    PluginEvent.reset(data, Page.Content, Page.Inject)
    window.postMessage(data, "*");
  }
})
// 接受来自inject.js的消息数据,然后中转到background.js
window.addEventListener("message", (event) => {
  let data: PluginEvent = event.data;
  if (PluginEvent.check(data, Page.Inject, Page.Content)) {
    console.log(...terminal.message(JSON.stringify(data)));
    PluginEvent.reset(data, Page.Content, Page.Devtools)
    if (connect) {
      connect.postMessage(data)
    } else {
      console.log(...terminal.log(`connect is null`));
      debugger;
    }
  }
}, false);

function checkGame() {
  let gameCanvas = document.querySelector("#GameCanvas");
  const sendData = new PluginEvent(Page.Content, Page.Devtools, Msg.Support, {
    support: !!gameCanvas,
    msg: "未发现GameCanvas,不支持调试游戏!"
  })
  if (connect) {
    connect.postMessage(sendData)
  } else {
    console.log(...terminal.log(`connect is null`));
    debugger;
  }
}

injectScript(ChromeConst.script.inject);
checkGame();