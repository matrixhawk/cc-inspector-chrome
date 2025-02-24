import { debugLog, Msg, Page, PluginEvent } from "../../core/types";
import { getDevToolsInspectorId } from "../../core/util";
import { Terminal } from "../terminal";
import "./notify";
import { tabMgr } from "./tabMgr";
const terminal = new Terminal(Page.Background);
debugLog && console.log(...terminal.init());

chrome.runtime.onConnect.addListener((port: chrome.runtime.Port) => {
  if (port.name === Page.Content) {
    const tab: chrome.tabs.Tab | undefined = port.sender?.tab;
    const tabID = tab.id;
    if (tabID === undefined || tabID <= 0) {
      return;
    }
    tabMgr.addTab(tab, port);
  } else if (port.name.startsWith(Page.Devtools)) {
    const id = getDevToolsInspectorId(port.name);
    console.log(`devtools tab id is ${id}`);
    const tab = tabMgr.findTab(id);
    if (tab) {
      tab.addDevtools(port);
    } else {
      // 没有发现与之对应的调试content，主动断开链接
      const event = new PluginEvent(Page.Background, Page.Devtools, Msg.DevtoolConnectError, "missing content");
      port.postMessage(event);
      port.disconnect();
    }
  }
});
chrome.runtime.onMessage.addListener((request: PluginEvent, sender: any, sendResponse: any) => {
  const event = PluginEvent.create(request);
  const tabID = sender.tab.id;
  const tabInfo = tabMgr.findTab(tabID);
  if (tabInfo) {
    if (event.check(Page.Content, Page.Background)) {
      //  监听来自content.js发来的事件，将消息转发到devtools
      event.reset(Page.Background, Page.Devtools);
      console.log(`%c[Message]url:${sender.url}]\n${JSON.stringify(request)}`, "color:green");
      if (tabInfo.devtool) {
        tabInfo.devtool.send(request);
      }
    }
  }
});
chrome.tabs.onActivated.addListener(({ tabId, windowId }) => {});
chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
  //
});
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // 页面发生刷新，通知重新生成数据
  if (changeInfo.status === "complete") {
    const { id } = tab;
    // -1为自己
    if (id >= 0) {
      const tabInfo = tabMgr.findTab(id);
      if (tabInfo) {
        tabInfo.useFrame(0);
      }
    }
  }
});
