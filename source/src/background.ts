import {Page, PluginEvent, Msg} from "@/core/types";

let Devtools: chrome.runtime.Port | null = null;
let Content: chrome.runtime.Port | null = null;
console.log('on background')

chrome.runtime.onConnect.addListener((port: chrome.runtime.Port) => {
  switch (port.name) {
    case Page.Devtools: {
      Devtools = port;
      onPortConnect(port,
        (data: PluginEvent) => {
          // 从devtools过来的消息统一派发到Content中
          if (PluginEvent.check(data, Page.Devtools, Page.Background)) {
            PluginEvent.reset(data, Page.Background, Page.Content);
            Content && Content.postMessage(data)
          }
        },
        () => {
          Devtools = null;
        })
      break;
    }
    case Page.Content: {
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
    // 如果多个页面都监听 onMessage 事件，对于某一次事件只有第一次调用 sendResponse() 能成功发出回应，所有其他回应将被忽略。
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
chrome.runtime.onMessage.addListener((request: PluginEvent, sender: any, sendResponse: any) => {
    if (PluginEvent.check(request, Page.Content, Page.Background)) {
      PluginEvent.reset(request, Page.Background, Page.Devtools)
      console.log(`%c[Message]url:${sender.url}]\n${JSON.stringify(request)}`, 'color:green')
      sendResponse && sendResponse(request);
      Devtools && Devtools.postMessage(request);
    }
  }
);

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  console.warn(changeInfo.status)
  if (changeInfo.status === "complete") {
    // 加载新的url
    if (Content) {
      let data = new PluginEvent(
        Page.Background,
        Page.Content,
        Msg.UrlChange,
        {url: tab.favIconUrl}
      );
      Content.postMessage(data);
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

