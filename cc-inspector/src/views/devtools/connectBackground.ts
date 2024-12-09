import { Msg, Page, PluginEvent } from "../../core/types";
export type BackgroundCallback = (data: PluginEvent, sender: any) => void;
class ConnectBackground {
  connect: chrome.runtime.Port | null = null;

  constructor() {
    this._initConnect();
  }

  private _initConnect() {
    if (chrome && chrome.runtime) {
      this.connect = chrome.runtime.connect({ name: Page.Devtools });
      this.connect.onDisconnect.addListener(() => {
        console.log(`%c[Connect-Dis]`, "color:red;")
        this.connect = null;
      })
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
  testMessage(data: PluginEvent) {
    if (this.callback) {
      this.callback(data, null);
    }
  }
  sendMsgToContentScript(msg: Msg, data?: any) {
    if (!chrome || !chrome.devtools) {
      return;
    }
    this.postMessageToBackground(msg, data);
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
