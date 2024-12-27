import { PluginEvent } from "../../core/types";
import { PortMan } from "./portMan";
import { portMgr } from "./portMgr";

export class PortContent extends PortMan {
  init(): void {
    // content连上来要同时devtools更新
    portMgr._updateFrames();
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
      portMgr._updateFrames();
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
