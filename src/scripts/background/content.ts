import { debugLog, Page, PluginEvent } from "../../core/types";
import { FrameDetails } from "../../views/devtools/data";
import { Terminal } from "../terminal";
import { TabInfo } from "./tabInfo";

export class Content {
  public frameID: number = 0;
  /**
   * port的名字标识
   */
  public name: string = Page.None;
  /**
   * tab.id作为唯一标识
   */
  public tabID: number | null = null;
  public title: string = "";
  public url: string = "";
  protected port: chrome.runtime.Port | null = null;
  public tab: chrome.tabs.Tab | null = null;
  public terminal: Terminal = null;
  /**
   * 是否正在使用
   */
  public using: boolean = false;
  private tabInfo: TabInfo | null = null;
  constructor(tab: chrome.tabs.Tab, port: chrome.runtime.Port, tabInfo: TabInfo) {
    this.tabInfo = tabInfo;
    this.port = port;
    this.tab = tab;
    this.name = port.name;
    this.tabID = tab.id;
    this.url = port.sender.url;
    this.title = tab.title;
    this.terminal = new Terminal(`Port-${this.name}`);
    port.onMessage.addListener((data: any, port: chrome.runtime.Port) => {
      const event = PluginEvent.create(data);
      debugLog && console.log(...this.terminal.chunkMessage(event.toChunk()));
      if (event.valid && this.onMessage) {
        this.onMessage(event);
      } else {
        debugLog && console.log(...this.terminal.log(JSON.stringify(data)));
      }
    });
    port.onDisconnect.addListener((port: chrome.runtime.Port) => {
      const ret = ["localhost", "127.0.0.1"].find((el) => port.sender.url.includes(el));
      if (ret) {
        console.log("local port disconnect");
        // debugger;
      }
      debugLog && console.log(...this.terminal.disconnect(""));
      this.onDisconnect(port);
    });
    this.frameID = port.sender.frameId || 0;
  }
  getFrameDetais(): FrameDetails {
    return {
      tabID: this.tabID,
      url: this.url,
      frameID: this.frameID,
    };
  }
  private onDisconnect(disPort: chrome.runtime.Port) {
    this.tabInfo.removePort(this);
  }

  public onMessage(data: PluginEvent) {
    // content的数据一般都是要同步到devtools
    if (data.isTargetDevtools()) {
      if (this.tabInfo.devtool) {
        this.tabInfo.devtool.send(data);
      } else {
        debugger;
      }
    } else {
      debugger;
    }
  }

  send(data: PluginEvent) {
    if (this.port) {
      this.port.postMessage(data);
    }
  }
}
