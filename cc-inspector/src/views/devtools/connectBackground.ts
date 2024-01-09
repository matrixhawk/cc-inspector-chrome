import {PluginEvent, Page, Msg} from "../../core/types";

class ConnectBackground {
  connect: chrome.runtime.Port | null = null;

  constructor() {
    this._initConnect();
  }

  private _initConnect() {
    if (chrome && chrome.runtime) {
      this.connect = chrome.runtime.connect({name: Page.Devtools});
      this.connect.onDisconnect.addListener(() => {
        console.log(`%c[Connect-Dis]`, "color:red;")
        this.connect = null;
      })
    }
  }

  onBackgroundMessage(cb: Function) {
    if (this.connect) {
      this.connect.onMessage.addListener((event, sender) => {
        cb && cb(event, sender)
      });
    }
  }

  postMessageToBackground(msg: Msg, data?: any) {
    if (this.connect) {
      let sendData = new PluginEvent(Page.Devtools, Page.Background, msg, data)
      this.connect.postMessage(sendData)
    } else {
      console.warn("重新和background建立链接")
      this._initConnect();
      this.postMessageToBackground(msg, data)
    }
  }

}

export const connectBackground = new ConnectBackground();
