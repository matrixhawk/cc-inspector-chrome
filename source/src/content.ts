// content.js 和原始界面共享DOM，具有操作dom的能力
// 但是不共享js,要想访问页面js,只能通过注入的方式
import {injectScript} from "@/core/util";
import {Msg, Page, PluginEvent} from "@/core/types";

injectScript("js/inject.js");

// 和background.js保持长连接通讯
let conn = chrome.runtime.connect({name: Page.Content})
conn.onMessage.addListener((data: PluginEvent, sender) => {
  // 将background.js的消息返回到injection.js
  if (PluginEvent.check(data, Page.Background, Page.Content)) {
    // console.log(`%c[Connect-Message] ${JSON.stringify(data)}`, "color:green;")
    console.log('[Connect-Message]: ', data);
    PluginEvent.reset(data, Page.Content, Page.Inject)
    window.postMessage(data, "*");
  }
})

// 接受来自inject.js的消息数据,然后中转到background.js
window.addEventListener('message', function (event) {
  let data: PluginEvent = event.data;
  if (PluginEvent.check(data, Page.Inject, Page.Content)) {
    // console.log(`%c[Window-Message] ${JSON.stringify(data)}`, "color:green;");
    console.log('[Window-Message]: ', data);
    PluginEvent.reset(data, Page.Content, Page.Background)
    chrome.runtime.sendMessage(data);
  }
}, false);


let gameCanvas = document.querySelector("#GameCanvas");
if (!gameCanvas) {
  let sendData = new PluginEvent(Page.Content, Page.Background, Msg.Support, {
    support: false,
    msg: "未发现GameCanvas,不支持调试游戏!"
  })
  chrome.runtime.sendMessage(sendData, (ret) => {
    console.log(ret)
  });
}
