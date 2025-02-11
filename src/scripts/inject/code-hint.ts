import { TreeData } from "../../views/devtools/data";
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
  if (funArray.length > 1) {
    console.warn(`多个事件回调函数${funArray.length}`);
  }
  return funArray.map((fun) => {
    // @ts-ignore
    return fun.callback;
  });
}
export function calcCodeHint(node: any, data: TreeData) {
  data.codeTouchStart = getCallbacks(node, ShowCode.TouchStart).length;
  data.codeTouchMove = getCallbacks(node, ShowCode.TouchMove).length;
  data.codeTouchEnd = getCallbacks(node, ShowCode.TouchEnd).length;
  data.codeTouchCancel = getCallbacks(node, ShowCode.TouchCancel).length;
  data.codeButtonClick = getCallbacks(node, ShowCode.ButtonClick).length;
}
