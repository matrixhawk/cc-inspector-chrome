import { ChromeConst } from "cc-plugin/src/chrome/const";
import { Msg, Page, PluginEvent } from "../../core/types";
import { FrameDetails } from "../../views/devtools/data";
import { Terminal } from "../terminal";
import { portMgr } from "./portMgr";

export abstract class PortMan {
  /**
   * port的名字标识
   */
  public name: string = Page.None;
  /**
   * tab.id作为唯一标识
   */
  public id: number | null = null;
  public title: string = "";
  public url: string = "";
  public port: chrome.runtime.Port | null = null;
  public tab: chrome.tabs.Tab | null = null;
  public onDisconnect: (port: chrome.runtime.Port) => void | null = null;
  public onMessage: (data: PluginEvent) => void | null = null;
  public terminal: Terminal = null;
  constructor(tab: chrome.tabs.Tab, port: chrome.runtime.Port) {
    this.port = port;
    this.tab = tab;
    this.name = port.name;
    this.id = tab.id;
    this.url = tab.url;
    this.title = tab.title;
    this.terminal = new Terminal(`Port-${this.name}/ID-${this.id}`);
    port.onMessage.addListener((data: any, sender: any) => {
      const str = `${sender.name}\n${JSON.stringify(data)}`
      console.log(... this.terminal.green(str));
      // 如果多个页面都监听 onMessage 事件，对于某一次事件只有第一次调用 sendResponse() 能成功发出回应，所有其他回应将被忽略。
      // sender.postMessage(data);
      const cls = PluginEvent.create(data);
      if (this.onMessage) {
        this.onMessage(cls);
      }
    });
    port.onDisconnect.addListener((port: chrome.runtime.Port) => {
      console.log(...this.terminal.disconnect(""));
      if (this.onDisconnect) {
        this.onDisconnect(port);
      }
    });
  }
  abstract init(): void;

  isConnectPort() {
    return this.name === Page.Content;
  }
  isDevtoolsPort() {
    return this.name === Page.Devtools;
  }
}