import { FunctionInfo, TreeData } from "../../views/devtools/data";
import { ShowCode } from "./types";
declare const cc: any;

function getKey(code: ShowCode): string {
  const map = {};
  map[ShowCode.TouchStart] = cc.Node.EventType.TOUCH_START;
  map[ShowCode.TouchMove] = cc.Node.EventType.TOUCH_MOVE;
  map[ShowCode.TouchEnd] = cc.Node.EventType.TOUCH_END;
  map[ShowCode.TouchCancel] = cc.Node.EventType.TOUCH_CANCEL;
  map[ShowCode.ButtonClick] = cc.Button.EventType.CLICK;
  const key = map[code];
  return key || "";
}

export function getCallbacks(node: any, code: ShowCode) {
  const key = getKey(code);
  if (!key) {
    return [];
  }
  if (!node._eventProcessor.bubblingTarget) {
    return [];
  }
  const tables = node._eventProcessor.bubblingTarget._callbackTable[key];
  if (!tables) {
    return [];
  }
  const funArray: Function[] = tables.callbackInfos;
  if (!funArray || funArray.length === 0) {
    return [];
  }
  return funArray.map((fun) => {
    // @ts-ignore
    return fun.callback;
  });
}
export const ANONYMOUS = "anonymous";

function functionInfo(node: any, type: ShowCode): FunctionInfo[] {
  return getCallbacks(node, type).map((item) => {
    let desc = item.toString();
    const max = 50;
    if (desc.length > max) {
      // desc = desc.substr(0, max) + "...";
    }
    return {
      name: item.name || ANONYMOUS,
      desc,
    } as FunctionInfo;
  });
}
export function calcCodeHint(node: any, data: TreeData) {
  data.codeTouchStart = functionInfo(node, ShowCode.TouchStart);
  data.codeTouchMove = functionInfo(node, ShowCode.TouchMove);
  data.codeTouchEnd = functionInfo(node, ShowCode.TouchEnd);
  data.codeTouchCancel = functionInfo(node, ShowCode.TouchCancel);
  data.codeButtonClick = functionInfo(node, ShowCode.ButtonClick);
}
