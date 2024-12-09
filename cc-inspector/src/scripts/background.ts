import { ChromeConst } from "cc-plugin/src/chrome/const";
import { Msg, Page, PluginEvent } from "../core/types";

// @ts-ignore
// import * as UA from "universal-analytics";
import { v4 } from "uuid";
import { FrameDetails } from "../views/devtools/data";

// 统计服务
const userID = localStorage.getItem("userID") || v4();
// UA("UA-134924925-3", userID);

console.log("on background");

class PortMan {
  public currentUseContentFrameID = 0;
  public content: Array<chrome.runtime.Port> = []; // 因为iframe的原因，可能对应多个，主iframe的id===0
  public devtools: chrome.runtime.Port | null = null;
  public id: number | null = null; // tab.id作为唯一标识
  public title: string = "";
  public url: string = "";
  private mgr: PortManagement | null = null;

  constructor(mgr: PortManagement, { id, url, title }: any) {
    this.mgr = mgr;
    this.id = id;
    this.url = url;
    this.title = title;
  }

  private onPortConnect(
    port: chrome.runtime.Port,
    onMsg: Function,
    onDisconnect: Function
  ) {
    console.log(`%c[Connect] ${port.name}`, "color:green");
    port.onMessage.addListener((data: any, sender: any) => {
      console.log(
        `%c[Connect-Message] ${sender.name}\n${JSON.stringify(data)}`,
        "color:blue;"
      );
      // 如果多个页面都监听 onMessage 事件，对于某一次事件只有第一次调用 sendResponse() 能成功发出回应，所有其他回应将被忽略。
      // sender.postMessage(data);
      onMsg && onMsg(data);
    });
    port.onDisconnect.addListener((port: chrome.runtime.Port) => {
      console.log(`%c[Connect-Dis] ${port.name}`, "color:red");
      onDisconnect && onDisconnect(port);
    });
  }

  getCurrentUseContent(): chrome.runtime.Port | null {
    return (
      this.content.find(
        (el) =>
          el.sender?.frameId !== undefined &&
          el.sender.frameId === this.currentUseContentFrameID
      ) || null
    );
  }

  _updateFrames() {
    let data: FrameDetails[] = this.content.map((item) => {
      return {
        url: item.sender?.url || "",
        frameID: item.sender?.frameId || 0,
      };
    });
    let event = new PluginEvent(
      Page.Background,
      Page.Devtools,
      Msg.UpdateFrames,
      data
    );
    this.sendDevtoolMsg(event);
  }

  dealConnect(port: chrome.runtime.Port) {
    switch (port.name) {
      case Page.Content: {
        this.content.push(port);
        this._updateFrames();
        this.onPortConnect(
          port,
          (data: PluginEvent) => {
            if (data.target === Page.Devtools) {
              this.sendDevtoolMsg(data);
            }
          },
          (disPort: chrome.runtime.Port) => {
            const index = this.content.findIndex(
              (el) =>
                disPort.sender?.frameId !== undefined &&
                el.sender?.frameId !== undefined &&
                el.sender?.frameId === disPort.sender?.frameId
            );
            this.content.splice(index, 1);
            this._updateFrames();
            this.checkValid();
          }
        );
        break;
      }
      case Page.Devtools: {
        this.devtools = port;
        this._updateFrames(); // 当devtools链接后，主动派发frames数据
        this.onPortConnect(
          port,
          (data: PluginEvent) => {
            if (data.msg === Msg.UseFrame) {
              this.currentUseContentFrameID = data.data;
              // 更新这个frame的tree
              this.updateCurrentFrameTree();
            } else {
              // 从devtools过来的消息统一派发到Content中
              if (PluginEvent.check(data, Page.Devtools, Page.Background)) {
                if (data.msg === Msg.TreeInfo) {
                  if (this.currentUseContentFrameID !== data.data) {
                    console.log(`frameID[${data.data}]不一致`);
                  }
                }
                PluginEvent.reset(data, Page.Background, Page.Content);
                this.getCurrentUseContent()?.postMessage(data);
              }
            }
          },
          () => {
            this.devtools = null;
            this.checkValid();
          }
        );
        break;
      }
    }
  }

  private updateCurrentFrameTree() {
    const sendData = new PluginEvent(
      Page.Background,
      Page.Content,
      Msg.Support
    );
    this.getCurrentUseContent()?.postMessage(sendData);
  }

  checkValid() {
    if (!this.devtools && !this.content.length) {
      this.mgr?.remove(this);
    }
  }

  sendContentMsg(data: PluginEvent) {
    this.getCurrentUseContent()?.postMessage(data);
  }

  sendDevtoolMsg(data: PluginEvent) {
    this.devtools?.postMessage(data);
  }
}

class PortManagement {
  port: Array<PortMan> = [];

  constructor() {
    this.initConnect();
    chrome.runtime.onMessage.addListener(
      (request: PluginEvent, sender: any, sendResponse: any) => {
        const tabID = sender.tab.id;
        const portMan: PortMan | undefined = this.find(tabID);
        if (portMan) {
          if (PluginEvent.check(request, Page.Content, Page.Background)) {
            //  监听来自content.js发来的事件，将消息转发到devtools
            PluginEvent.reset(request, Page.Background, Page.Devtools);
            console.log(
              `%c[Message]url:${sender.url}]\n${JSON.stringify(request)}`,
              "color:green"
            );
            portMan.sendDevtoolMsg(request);
          }
        }
      }
    );
    chrome.tabs.onActivated.addListener(({ tabId, windowId }) => { });
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      // 页面发生刷新，通知重新生成数据
      if (changeInfo.status === "complete") {
        const { id } = tab;
        // -1为自己
        if (id && id > -1) {
          let portMan = this.find(id);
          if (portMan) {
            let data = new PluginEvent(
              Page.Background,
              Page.Content,
              Msg.Support
            );
            portMan.sendContentMsg(data);
          }
        }
      }
    });
  }

  isDevtools(port: chrome.runtime.Port) {
    const devtoolsUrl = `chrome-extension://${port.sender?.id}/${ChromeConst.html.devtools}`;
    if (port.sender?.url === devtoolsUrl) {
    }
  }

  initConnect() {
    chrome.runtime.onConnect.addListener((port: chrome.runtime.Port) => {
      if (port.name === Page.Devtools) {
        // devtool链接过来没有port.sender.tab
        chrome.tabs.getSelected((tab: chrome.tabs.Tab) => {
          this._onConnect(tab, port);
        });
      } else {
        const tab: chrome.tabs.Tab | undefined = port.sender?.tab;
        if (tab) {
          this._onConnect(tab, port);
        }
      }
    });
  }

  private _onConnect(tab: chrome.tabs.Tab, port: chrome.runtime.Port) {
    const { id, title, url } = tab;
    if (id !== undefined && id > -1) {
      let portMan: PortMan | undefined = this.find(id);
      if (!portMan) {
        portMan = new PortMan(this, { id, title, url });
        this.port.push(portMan);
      }
      portMan.dealConnect(port);
    }
  }

  find(id: number): PortMan | undefined {
    return this.port.find((el) => el.id === id);
  }

  remove(item: PortMan) {
    let index = this.port.findIndex((el) => el === item);
    if (index > -1) {
      this.port.splice(index, 1);
    }
  }
}

(window as any).backgroundInstance = new PortManagement();

function createPluginMenus() {
  const menus = [];

  let parent = chrome.contextMenus.create({
    id: "parent",
    title: "CC-Inspector",
  });
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
    title: "通知",
  });

  chrome.contextMenus.onClicked.addListener(function (info, tab) {
    if (info.menuItemId === "test") {
      alert("您点击了右键菜单！");
    } else if (info.menuItemId === "notify") {
      chrome.notifications.create("null", {
        type: "basic",
        iconUrl: "icons/48.png",
        title: "通知",
        message: "测试通知",
      });
    }
  });
}

chrome.contextMenus.removeAll(function () {
  createPluginMenus();
});
