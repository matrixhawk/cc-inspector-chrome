import { Msg, Page, PluginEvent } from "../../core/types";
import { PortMan } from "./portMan";
import { PortDevtools } from "./portDevtools";
import { PortContent } from "./portContent";
import { FrameDetails } from "views/devtools/data";
import { Terminal } from "../terminal";

export class PortMgr {
  /**
   * 所有的链接都在这里
   * 因为iframe的原因，可能对应多个，主iframe的id是0
   */
  public portArray: Array<PortMan> = [];
  /**
   * 当前正在通讯的frameID，因为游戏可能被好几个iframe嵌套
   */
  private currentUseContentFrameID = 0;
  private terminal = new Terminal('PortMgr');
  public findDevtoolsPort() {
    return this.portArray.find((el) => el.name === Page.Devtools);
  }
  public findPort(id: number): PortMan | null {
    return this.portArray.find((el) => el.id === id) || null;
  }
  public _updateFrames() {
    // 将content类型的port收集起来，同步到devtools
    const data: FrameDetails[] = [];
    this.portArray.forEach(item => {
      if (item.isConnectPort()) {
        data.push({
          url: item.port.sender?.url || "",
          frameID: item.port.sender?.frameId || 0,
        })
      }
    })
    const event = new PluginEvent(Page.Background, Page.Devtools, Msg.UpdateFrames, data);
    this.sendDevtoolMsg(event);
  }

  addPort(tab: chrome.tabs.Tab, port: chrome.runtime.Port): PortMan | null {
    let portMan: PortMan = null;
    switch (port.name) {
      case Page.Devtools: {
        portMan = new PortDevtools(tab, port);
        break;
      }
      case Page.Content: {
        portMan = new PortContent(tab, port);
        break;
      }
      default: {
        debugger
        break;
      }
    }
    if (portMan) {
      this.portArray.push(portMan);
      this.logState();
      return portMan;
    }
    return null;
  }
  public logState() {
    let arr: Array<{ name: string, id: number, url: string }> = [];
    let str: string[] = [];
    for (let i = 0; i < this.portArray.length; i++) {
      const port = this.portArray[i];
      arr.push({
        name: port.name,
        id: port.id,
        url: port.url
      });
      str.push(`[${i + 1}] time:${new Date(port.timestamp).toLocaleString()}, name:${port.name}, id:${port.id}, url:${port.url}`);
    }

    if (arr.length) {
      // console.table(arr)
      console.log(... this.terminal.log(str.join('\n'), true));
    } else {
      console.log(... this.terminal.log("no port connected"));
    }
  }
  public removePort(item: PortMan) {
    let index = this.portArray.findIndex((el) => el === item);
    if (index > -1) {
      this.portArray.splice(index, 1);
      this.logState();
    }
  }

  sendContentMsg(data: PluginEvent) {
    this.getCurrentUseContent()?.postMessage(data);
  }
  sendDevtoolMsg(data: PluginEvent) {
    const portManArray = this.portArray.filter(el => el.isDevtoolsPort());
    if (portManArray.length) {
      portManArray.forEach(portMan => {
        portMan.port.postMessage(data);
      })
    } else {
      console.log('not find devtools port');
    }
  }
  getCurrentUseContent(): chrome.runtime.Port | null {
    const portMan = this.portArray.find((portMan: PortMan) => {
      const el = portMan.port;
      const b1 = el.sender?.frameId !== undefined;
      const b2 = el.sender.frameId === this.currentUseContentFrameID
      return b1 && b2
    })
    if (portMan) {
      return portMan.port;
    } else {
      return null;
    }
  }
  useFrame(id: number) {
    this.currentUseContentFrameID = id;
    // 更新这个frame的tree
    const sendData = new PluginEvent(Page.Background, Page.Content, Msg.Support);
    this.getCurrentUseContent()?.postMessage(sendData);
  }
  isCurrentFrme(id: number) {
    return this.currentUseContentFrameID === id
  }
}
export const portMgr = new PortMgr();