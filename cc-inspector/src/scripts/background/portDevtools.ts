import { Msg, Page, PluginEvent } from "../../core/types";
import { PortMan } from "./portMan";
import { portMgr } from "./portMgr";

export class PortDevtools extends PortMan {
  init(): void {
    // 当devtools链接后，主动同步frames数据
    portMgr._updateFrames();
    this.onDisconnect = () => {
      portMgr.removePort(this);
    };
    this.onMessage = (data: PluginEvent) => {
      if (data.msg === Msg.UseFrame) {
        portMgr.useFrame(data.data);
      } else {
        // 从devtools过来的消息统一派发到Content中
        if (data.check(Page.Devtools, Page.Background)) {
          if (data.msg === Msg.TreeInfo) {
            if (portMgr.isCurrentFrme(data.data)) {
              console.log(`frameID[${data.data}]不一致`);
            }
          }
          data.reset(Page.Background, Page.Content);
          const port = portMgr.getCurrentUseContent();
          if (!port) {
            console.warn(`not find andy port`);
            return;
          }
          port.postMessage(data);
        }
      }
    };
  }
}
