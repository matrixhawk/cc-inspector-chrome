import { PluginEvent } from "../../core/types";
import { FrameDetails } from "../../views/devtools/data";
import { PortMan } from "./portMan";
import { portMgr } from "./portMgr";

export class PortContent extends PortMan {
  protected frameID: number = 0;
  constructor(tab: chrome.tabs.Tab, port: chrome.runtime.Port) {
    super(tab, port);
    this.frameID = port.sender.frameId || 0;
  }
  getFrameDetais(): FrameDetails {
    return {
      url: this.url,
      frameID: this.frameID,
    };
  }
  init(): void {
    // 使用新连上来的content
    const { frameId } = this.port.sender;
    if (frameId !== undefined) {
      portMgr.useFrame(frameId);
    }
    // 新的content连上来，需要更新devtools
    portMgr.updateFrames();
    this.onDisconnect = (disPort: chrome.runtime.Port) => {
      /**
       *  const index = this.content.findIndex((el) =>
            disPort.sender?.frameId !== undefined &&
            el.sender?.frameId !== undefined &&
            el.sender?.frameId === disPort.sender?.frameId
          );
       */
      // content失去链接需要更新Devtools
      portMgr.removePort(this);
      portMgr.updateFrames();
    };
    this.onMessage = (data: PluginEvent) => {
      // content的数据一般都是要同步到devtools
      if (data.isTargetDevtools()) {
        portMgr.sendDevtoolMsg(data);
      } else {
        debugger;
      }
    };
  }
}
