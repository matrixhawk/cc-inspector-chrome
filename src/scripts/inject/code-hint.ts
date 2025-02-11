import { FunctionInfo, TreeData } from "../../views/devtools/data";
import { ShowCode } from "./types";
declare const cc: any;

function getKey(code: ShowCode): string {
  const map = {};
  map[ShowCode.TouchStart] = cc.Node.EventType.TOUCH_START;
  map[ShowCode.TouchMove] = cc.Node.EventType.TOUCH_MOVE;
  map[ShowCode.TouchEnd] = cc.Node.EventType.TOUCH_END;
  map[ShowCode.TouchCancel] = cc.Node.EventType.TOUCH_CANCEL;
  if (cc.Button?.EventType?.CLICK) {
    map[ShowCode.ButtonClick] = cc.Button.EventType.CLICK;
  }
  const key = map[code];
  return key || "";
}

function getButton(node: any, fillFn: boolean): FunctionInfo[] {
  const button = node.getComponent(cc.Button);
  if (!button) {
    return [];
  }
  if (!button.clickEvents || button.clickEvents.length === 0) {
    return [];
  }
  const arr: Array<{ handler: string; target: any; _componentId: string }> = button.clickEvents;
  const ret: FunctionInfo[] = [];
  for (let i = 0; i < arr.length; i++) {
    const item = arr[i];
    const compType = cc.js.getClassById(item._componentId);
    if (!compType) {
      continue;
    }
    const comp = item.target.getComponent(compType);
    if (!comp || !cc.isValid(comp)) {
      continue;
    }
    const handler = comp[item.handler];
    if (typeof handler !== "function") {
      continue;
    }
    const info = getFn(handler, fillFn);
    info.name = item.handler;
    ret.push(info);
  }
  return ret;
}

export function getCallbacks(node: any, code: ShowCode, fillFn: boolean = false): FunctionInfo[] {
  if (code === ShowCode.ButtonClickEvents) {
    return getButton(node, fillFn);
  } else {
    return getTouch(node, code, fillFn);
  }
}

function getTouch(node: any, code: ShowCode, fillFn: boolean = false): FunctionInfo[] {
  const key = getKey(code);
  if (!key) {
    return [];
  }
  if (!node._eventProcessor) {
    return [];
  }
  if (!node._eventProcessor.bubblingTarget) {
    return [];
  }
  const tables = node._eventProcessor.bubblingTarget._callbackTable[key];
  if (!tables) {
    return [];
  }
  const infos: Array<any> = tables.callbackInfos;
  if (!infos || infos.length === 0) {
    return [];
  }
  return infos.map((fun) => {
    // @ts-ignore
    return getFn(fun.callback, fillFn);
  });
}

function getFn(item: Function, fillFn: boolean): FunctionInfo {
  let desc = item.toString();
  const max = 50;
  if (desc.length > max) {
    // desc = desc.substr(0, max) + "...";
  }
  const ret: FunctionInfo = {
    name: item.name || ANONYMOUS,
    desc,
    fn: fillFn ? item : null,
  };
  return ret;
}
export const ANONYMOUS = "anonymous";

export function calcCodeHint(node: any, data: TreeData) {
  data.codeTouchStart = getCallbacks(node, ShowCode.TouchStart);
  data.codeTouchMove = getCallbacks(node, ShowCode.TouchMove);
  data.codeTouchEnd = getCallbacks(node, ShowCode.TouchEnd);
  data.codeTouchCancel = getCallbacks(node, ShowCode.TouchCancel);
  data.codeButtonClick = getCallbacks(node, ShowCode.ButtonClick);
  data.codeButtonEvents = getCallbacks(node, ShowCode.ButtonClickEvents);
}
