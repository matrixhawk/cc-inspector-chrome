import { Msg, RequestSupportData } from "../../core/types";
import { bridge } from "./bridge";

export function checkSupport() {
  bridge.send(Msg.RequestSupport, {} as RequestSupportData);
}
export function execInspect() {
  setTimeout(() => {
    chrome.devtools.inspectedWindow.eval(`DoInspect()`);
  }, 5);
}
