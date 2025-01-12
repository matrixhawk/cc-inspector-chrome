// content.js 和原始界面共享DOM，具有操作dom的能力
// 但是不共享js,要想访问页面js,只能通过注入的方式
import { ChromeConst } from "cc-plugin/src/chrome/const";
import { debugLog, Page, PluginEvent } from "../../core/types";
import { ga } from "../../ga";
import { GA_EventName } from "../../ga/type";
import { DocumentEvent } from "../const";
import { Terminal } from "../terminal";

const terminal = new Terminal(Page.Content);
debugLog && console.log(...terminal.init());

// #region 注入脚本
export function injectScript(url: string) {
  if (chrome && chrome.runtime && chrome.runtime.getURL) {
    let content = chrome.runtime.getURL(url);
    const script = document.createElement("script");
    script.setAttribute("type", "text/javascript");
    script.setAttribute("src", content);
    script.onload = function () {
      document.head.removeChild(script);
    };
    document.head.appendChild(script);
    debugLog && console.log(...terminal.green(`inject script success: ${content}`));
  } else {
    debugLog && console.log(...terminal.red("inject script failed"));
  }
}

document.addEventListener(DocumentEvent.EngineVersion, async (event: CustomEvent) => {
  const version: string = event.detail;
  if (version) {
    ga.fireEventWithParam(GA_EventName.EngineVersion, version);
  }
});
// #region 和Inject通讯
document.addEventListener(DocumentEvent.Inject2Content, (event: CustomEvent) => {
  let data: PluginEvent = PluginEvent.create(event.detail);
  if (data.valid && data.check(Page.Inject, Page.Content)) {
    debugLog && console.log(...terminal.chunkMessage(data.toChunk()));
    data.reset(Page.Content, Page.Devtools);
    if (connect) {
      // 接受来自inject.js的消息数据,然后中转到background.js
      connect.postMessage(data);
    } else {
      debugLog && console.log(...terminal.log(`connect is null`));
      throw new Error("connect is null");
    }
  } else {
    throw new Error(`invalid data: ${event.detail}`);
  }
});
// #region 和background通讯
let connect: chrome.runtime.Port = chrome.runtime.connect({ name: Page.Content });
connect.onDisconnect.addListener(() => {
  debugLog && console.log(...terminal.disconnect(""));
  connect = null;
});
connect.onMessage.addListener((data: PluginEvent, sender: chrome.runtime.Port) => {
  const event = PluginEvent.create(data);
  if (event.valid && event.check(Page.Background, Page.Content)) {
    debugLog && console.log(...terminal.chunkMessage(event.toChunk()));
    event.reset(Page.Content, Page.Inject);
    const e = new CustomEvent(DocumentEvent.Content2Inject, { detail: event });
    debugLog && console.log(...terminal.chunkSend(event.toChunk()));
    document.dispatchEvent(e);
  } else {
    throw new Error(`invalid data: ${data}`);
  }
});
injectScript(ChromeConst.script.inject);
