import {Msg, Page, PluginEvent} from "@/core/types";

console.log("on background")

class PortMan {
  content: chrome.runtime.Port | null = null;
  devtools: chrome.runtime.Port | null = null;
  public id: number | null = null;// tab.id作为唯一标识
  public title: string = "";
  public url: string = "";
  private mgr: PortManagement | null = null;

  constructor(mgr: PortManagement, {id, url, title}: any) {
    this.mgr = mgr;
    this.id = id;
    this.url = url;
    this.title = title;
  }

  private onPortConnect(port: chrome.runtime.Port, onMsg: Function, onDisconnect: Function) {
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

  dealConnect(port: chrome.runtime.Port) {
    switch (port.name) {
      case Page.Content: {
        this.content = port;
        this.onPortConnect(port,
          (data: PluginEvent) => {
            if (data.target === Page.Devtools) {
              this.sendDevtoolMsg(data);
            }
          },
          () => {
            this.content = null;
            this.checkValid();
          })
        break;
      }
      case Page.Devtools: {
        this.devtools = port;
        this.onPortConnect(port,
          (data: PluginEvent) => {
            // 从devtools过来的消息统一派发到Content中
            if (PluginEvent.check(data, Page.Devtools, Page.Background)) {
              PluginEvent.reset(data, Page.Background, Page.Content);
              this.content?.postMessage(data)
            }
          },
          () => {
            this.devtools = null;
            this.checkValid();
          })
        break
      }
    }
  }

  checkValid() {
    if (!this.devtools && !this.content) {
      this.mgr?.remove(this);
    }
  }

  sendContentMsg(data: PluginEvent) {
    this.content?.postMessage(data);
  }

  sendDevtoolMsg(data: PluginEvent) {
    this.devtools?.postMessage(data)
  }
}

class PortManagement {
  port: Array<PortMan> = [];

  constructor() {
    this.initConnect();
    chrome.runtime.onMessage.addListener((request: PluginEvent, sender: any, sendResponse: any) => {
      const tabID = sender.tab.id;
      const portMan: PortMan | undefined = this.find(tabID);
      if (portMan) {
        if (PluginEvent.check(request, Page.Content, Page.Background)) {
          //  监听来自content.js发来的事件，将消息转发到devtools
          PluginEvent.reset(request, Page.Background, Page.Devtools)
          console.log(`%c[Message]url:${sender.url}]\n${JSON.stringify(request)}`, "color:green")
          portMan.sendDevtoolMsg(request);
        }
      }
    })
    chrome.tabs.onActivated.addListener(({tabId, windowId}) => {
    })
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      // 页面发生刷新，通知重新生成数据
      if (changeInfo.status === "complete") {
        const {id} = tab;
        // -1为自己
        if (id && id > -1) {
          let portMan = this.find(id);
          if (portMan) {
            // let data = new PluginEvent(
            //   Page.Background,
            //   Page.Content,
            //   Msg.Test,
            //   {url: tab.url}
            // );
            // portMan.sendContentMsg(data);
          }
        }
      }
    })
  }

  initConnect() {
    chrome.runtime.onConnect.addListener((port: chrome.runtime.Port) => {
      if (port.name === Page.Devtools) {
        // devtool链接过来没有port.sender.tab
        chrome.tabs.getSelected((tab: chrome.tabs.Tab) => {
          this._onConnect(tab, port)
        })
      } else {
        const tab: chrome.tabs.Tab | undefined = port.sender?.tab;
        if (tab) {
          this._onConnect(tab, port)
        }
      }
    })
  }

  private _onConnect(tab: chrome.tabs.Tab, port: chrome.runtime.Port) {
    const {id, title, url} = tab;
    if (id !== undefined && id > -1) {
      let portMan: PortMan | undefined = this.find(id)
      if (!portMan) {
        portMan = new PortMan(this, {id, title, url});
        this.port.push(portMan);
      }
      portMan.dealConnect(port);
    }
  }

  find(id: number): PortMan | undefined {
    return this.port.find(el => el.id === id)
  }

  remove(item: PortMan) {
    let index = this.port.findIndex(el => el === item)
    if (index > -1) {
      this.port.splice(index, 1)
    }
  }
}

(window as any).backgroundInstance = new PortManagement();

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

