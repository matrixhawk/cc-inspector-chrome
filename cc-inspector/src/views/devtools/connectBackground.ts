import CCP from "cc-plugin/src/ccp/entry-render";
import { Msg, Page, PluginEvent } from "../../core/types";
import { TestClient, testServer, TestServer } from "./test/server";
export type BackgroundCallback = (data: PluginEvent, sender: any) => void;
if (chrome.devtools) {
  console.log("chrome devtools")
}
class ConnectBackground implements TestClient {
  connect: chrome.runtime.Port | null = null;
  constructor() {
    this._initConnect();
  }

  private _initConnect() {
    if (CCP.Adaptation.Env.isChromeRuntime) {
      this.connect = chrome.runtime.connect({ name: Page.Devtools });
      this.connect.onDisconnect.addListener(() => {
        console.log(`%c[Connect-Dis]`, "color:red;")
        this.connect = null;
      })
    } else {
      testServer.add(this);
    }
  }
  /**
   * 把callback保存为变量，方便测试
   */
  private callback: BackgroundCallback | null = null;
  onBackgroundMessage(cb: BackgroundCallback) {
    this.callback = cb;
    if (this.connect) {
      this.connect.onMessage.addListener((event, sender) => {
        cb && cb(event, sender)
      });
    }
  }
  recv(event: PluginEvent): void {
    this.doCallback(event);
  }
  doCallback(data: PluginEvent) {
    if (this.callback) {
      this.callback(data, null);
    }
  }
  sendMsgToContentScript(msg: Msg, data?: any) {
    if (CCP.Adaptation.Env.isChromeDevtools) {
      this.postMessageToBackground(msg, data);
    } else {
      testServer.recv(msg, data);
    }
  }
  postMessageToBackground(msg: Msg, data?: any) {
    if (CCP.Adaptation.Env.isChromeDevtools) {
      if (this.connect) {
        let sendData = new PluginEvent(Page.Devtools, Page.Background, msg, data)
        this.connect.postMessage(sendData)
      } else {
        console.warn("重新和background建立链接")
        this._initConnect();
        this.postMessageToBackground(msg, data)
      }
    } else {
      testServer.recv(msg, data);
    }
  }

}

export const connectBackground = new ConnectBackground();
