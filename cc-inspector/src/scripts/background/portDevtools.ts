import { Msg, Page, PluginEvent, RequestTreeInfoData, RequestUseFrameData } from "../../core/types";
import { PortMan } from "./portMan";
import { portMgr } from "./portMgr";

export class PortDevtools extends PortMan {
  init(): void {
    // 当devtools链接后，主动同步frames数据
    portMgr.updateFrames();
    this.onDisconnect = () => {
      portMgr.removePort(this);
    };
    this.onMessage = (data: PluginEvent) => {
      if (data.msg === Msg.RequestUseFrame) {
        portMgr.useFrame((data.data as RequestUseFrameData).id);
      } else {
        // 从devtools过来的消息统一派发到Content中
        if (data.check(Page.Devtools, Page.Background)) {
          if (data.msg === Msg.RequstTreeInfo) {
            const d = data.data as RequestTreeInfoData;
            if (!portMgr.isCurrentFrme(d.frameID)) {
              console.log(`frameID[${data.data}]不一致`);
              debugger;
            }
          }
          data.reset(Page.Background, Page.Content);
          const port = portMgr.getCurrentUsePort();
          if (!port) {
            console.warn(`not find any port`);
            return;
          }
          port.send(data);
        } else {
          debugger;
        }
      }
    };
  }
}
