export enum Page {
  Inject = "Inject",
  Devtools = "Devtools",
  Background = 'Background',
  Content = "Content",
  Popup = "Popup",
  Options = "Options",
}

export enum Msg {
  NodeInfo = "node-info",// 具体的节点信息
  TreeInfo = "tree-info",// 节点树信息
  Support = "game-support",// 游戏支持信息
  MemoryInfo = "memory-info",//
  TabsInfo = "tabs_info", // 当前页面信息
  UrlChange = "url_change", // 网址发生变化
  SetProperty = "set-property", // 设置node属性
}

export class PluginEvent {
  msg: Msg | null = null;
  data: any = null;
  target: Page | null = null; // 事件要发送的目标

  constructor(target: Page, msg: Msg, data?: any) {
    if (PageInclude(target)) {
      this.target = target;
      this.msg = msg;
      this.data = data || null;
    } else {
      console.warn(`无效的target: ${target}`)
    }
  }
}

function inEnum(enumValues: any, value: Page | Msg) {
  for (let key in enumValues) {
    if (enumValues.hasOwnProperty(key)) {
      //@ts-ignore
      let itemEnum = enumValues[key] as string;
      if (itemEnum === value) {
        return true
      }
    }
  }
  return false;
}

export function PageInclude(page: Page) {
  return inEnum(Page, page);
}


export function MsgInclude(msg: Msg) {
  return inEnum(Msg, msg)
}
