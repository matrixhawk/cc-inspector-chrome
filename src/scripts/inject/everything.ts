import { Msg } from "../../core/types";
import { Inspector } from "./inspector";

// 和everything插件交互
export class Everything {
  // 支持多开creator，遍历everything插件的server
  private inspector: Inspector | null = null;
  init(inspector: Inspector) {
    this.inspector = inspector;
  }
  test() {
    const port = 2505;
    fetch(`http://localhost:${port}/test`)
      .then((e) => {})
      .catch((e) => {
        console.log(e);
      });
  }
  open(prefabUUID: string) {
    console.log("open prefab：", prefabUUID);
    // const url = new URL(window.location.href);
    // const port = Number(url.port) - 1000 || 7456;
    const port = 2505; // 暂时拿不到编辑器api，暂时写死
    const url = `http://localhost:${port}/open?uuid=${prefabUUID}`;
    // console.log("open url：", url);
    fetch(url)
      .then((e) => {
        console.log(e);
      })
      .catch((e) => {
        this.inspector.sendMsgToContent(Msg.ResponseBuyEverything, {});
      });
  }
}
export const everything = new Everything();
