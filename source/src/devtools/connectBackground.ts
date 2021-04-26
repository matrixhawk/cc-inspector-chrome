import * as PluginMsg from "@/core/plugin-msg";
import {PluginEvent} from "@/devtools/type";

class ConnectBackground {
  connect: chrome.runtime.Port | null = null;

  constructor() {
    if (chrome && chrome.runtime) {
      this.connect = chrome.runtime.connect({name: PluginMsg.Page.Devtools});
      this.connect.onDisconnect.addListener(() => {
        console.log(`%c[Connect-Dis]`, 'color:red;')
        this.connect = null;
      })
    }
  }

  onBackgroundMessage(cb: Function) {
    if (this.connect) {
      this.connect.onMessage.addListener((event, sender) => {
        console.log(`[Message] ${JSON.stringify(event)}`);
        cb && cb(event, sender)
      });
    }
  }

  postMessage(data: PluginEvent) {
    if (this.connect) {
      this.connect.postMessage(data)
    } else {
      console.warn('没有和background建立链接')
    }
  }

}

export const connectBackground = new ConnectBackground();
