import { ChromeConst } from "cc-plugin/src/chrome/const";
import { Msg, Page, PluginEvent } from "../../core/types";
import { FrameDetails } from "../../views/devtools/data";
import { PortMan } from "./portMan";
import { PortMgr, portMgr } from "./portMgr";
import { Terminal } from "../terminal";
const terminal = new Terminal(Page.Background);
console.log(...terminal.init());
function isDevtools(port: chrome.runtime.Port) {
  const devtoolsUrl = `chrome-extension://${port.sender?.id}/${ChromeConst.html.devtools}`;
  if (port.sender?.url === devtoolsUrl) {
  }
}
function onTabConnect(tab: chrome.tabs.Tab, port: chrome.runtime.Port) {
  if (tab.id === undefined || tab.id <= 0) {
    debugger;
    return;
  }
  let portMan = portMgr.findPort(tab.id)
  if (portMan) {
    // 一个port发起多次发起链接，以最后一次的为数据通讯基准
    // portMgr.removePort(portMan);
  }
  portMan = portMgr.addPort(tab, port);
  portMan.init();
}
chrome.runtime.onConnect.addListener((port: chrome.runtime.Port) => {
  if (port.name === Page.Devtools) {
    // devtool链接过来没有port.sender.tab
    chrome.tabs.query({ active: true }, (tabs: chrome.tabs.Tab[]) => {
      tabs.forEach((tab) => {
        onTabConnect(tab, port);
      })
    });
  } else {
    const tab: chrome.tabs.Tab | undefined = port.sender?.tab;
    if (tab) {
      onTabConnect(tab, port);
    }
  }
});
chrome.runtime.onMessage.addListener((request: PluginEvent, sender: any, sendResponse: any) => {
  const tabID = sender.tab.id;
  const portMan: PortMan | undefined = portMgr.findPort(tabID);
  if (portMan) {
    if (PluginEvent.check(request, Page.Content, Page.Background)) {
      //  监听来自content.js发来的事件，将消息转发到devtools
      PluginEvent.reset(request, Page.Background, Page.Devtools);
      console.log(`%c[Message]url:${sender.url}]\n${JSON.stringify(request)}`, "color:green");
      portMgr.sendDevtoolMsg(request);
    }
  }
});
chrome.tabs.onActivated.addListener(({ tabId, windowId }) => { });
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // 页面发生刷新，通知重新生成数据
  if (changeInfo.status === "complete") {
    const { id } = tab;
    // -1为自己
    if (id && id > -1) {
      let portMan = portMgr.findPort(id);
      if (portMan) {
        let data = new PluginEvent(Page.Background, Page.Content, Msg.Support);
        portMgr.sendContentMsg(data);
      }
    }
  }
});
