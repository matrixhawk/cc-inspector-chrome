import * as  PluginMsg from "./core/plugin-msg"
import {PluginEvent} from "@/devtools/type";
import {MsgInclude} from "./core/plugin-msg";

let Devtools: chrome.runtime.Port | null = null;
let Content: chrome.runtime.Port | null = null;
console.log('on background')

chrome.runtime.onConnect.addListener((port: chrome.runtime.Port) => {
  switch (port.name) {
    case PluginMsg.Page.Devtools: {
      Devtools = port;
      onPortConnect(port,
        (data: PluginEvent) => {
          // 从devtools过来的消息统一派发到Content中
          if (MsgInclude(data.msg)) {
            Content && Content.postMessage(data)
          }
        },
        () => {
          Devtools = null;
        })
      break;
    }
    case PluginMsg.Page.Content: {
      Content = port;
      onPortConnect(port,
        () => {

        },
        () => {
          Content = null;

        })
      break
    }
  }
});

function onPortConnect(port: chrome.runtime.Port, onMsg: Function, onDisconnect: Function) {
  console.log(`%c[Connect] ${port.name}`, "color:blue;");
  port.onMessage.addListener((data: any, sender: any) => {
    console.log(`%c[Connect-Message] ${sender.name}\n${JSON.stringify(data)}`, "color:green;")
    // sender.postMessage(data);
    onMsg && onMsg(data);
  });
  port.onDisconnect.addListener((port: chrome.runtime.Port) => {
    console.log(`%c[Connect-Dis] ${port.name}`, "color:red");
    onDisconnect && onDisconnect()
  });
}


// background.js 更像是一个主进程,负责整个插件的调度,生命周期和chrome保持一致
//  监听来自content.js发来的事件，将消息转发到devtools
chrome.runtime.onMessage.addListener((request: any, sender: any, sendResponse: any) => {
    console.log(`%c[Message]url:${sender.url}]\n${JSON.stringify(request)}`, 'color:green')
    sendResponse && sendResponse(request);
    if (MsgInclude(request.msg)) {
      Devtools && Devtools.postMessage(request);
    }
  }
);

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (changeInfo.status === "complete") {
    // 加载新的url
    if (Content) {
      Content.postMessage(new PluginEvent(PluginMsg.Msg.UrlChange, {url: tab.favIconUrl}));
    }
  }
})

function createPluginMenus() {
  const menus = [];

  let parent = chrome.contextMenus.create({id: "parent", title: "CC-Inspector"});
  chrome.contextMenus.create({
    id: "test",
    title: "测试右键菜单",
    parentId: parent,
    // 上下文环境，可选：["all", "page", "frame", "selection", "link", "editable", "image", "video", "audio"]，默认page
    contexts: ["page"],
  });
  chrome.contextMenus.create({
    id: "notify",
    parentId: parent,
    title: "通知"
  })

  chrome.contextMenus.onClicked.addListener(function (info, tab) {
    if (info.menuItemId === "test") {
      alert("您点击了右键菜单！");
    } else if (info.menuItemId === "notify") {
      chrome.notifications.create("null", {
        type: "basic",
        iconUrl: "icons/48.png",
        title: "通知",
        message: "测试通知",
      })
    }
  })
}

chrome.contextMenus.removeAll(function () {
  createPluginMenus();
});

