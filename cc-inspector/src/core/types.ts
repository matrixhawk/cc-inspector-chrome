export enum Page {
  Inject = "Inject",
  Devtools = "Devtools",
  Background = "Background",
  Content = "Content",
  Popup = "Popup",
  Options = "Options",
}

export enum Msg {
  /**
   * 具体的节点信息
   */
  NodeInfo = "node-info",
  /**
   * 节点树信息
   */
  TreeInfo = "tree-info",
  /**
   * 游戏支持信息
   */
  Support = "game-support",// 
  MemoryInfo = "memory-info",//
  /**
   * 当前页面信息
   */
  TabsInfo = "tabs_info",
  /**
   * 获取页面ID
   */
  GetTabID = "GetTabID",
  /**
   * 更新页面的frame
   */
  UpdateFrames = "UpdateFrames",
  UseFrame = "UseFrame",
  GetObjectItemData = "GetObjectItemData",
  LogData = "LogData",
  /**
   * 设置node属性
   */
  SetProperty = "set-property",
  /**
   * 更新属性
   */
  UpdateProperty = "update-property",
}

export class PluginEvent {
  /**
   * 消息的类型
   */
  msg: Msg | null = null;
  /**
   * 携带的数据
   */
  data: any = null;

  /**
   * 事件发送的源头
   */
  source: Page | null = null;
  /**
   * 事件要发送的目标
   */
  target: Page | null = null;

  static check(event: PluginEvent, source: Page, target: Page) {
    return event && source && target && event.source === source && event.target === target;
  }

  static reset(event: PluginEvent, source: Page | null, target: Page | null) {
    if (event && source && target) {
      event.source = source;
      event.target = target;
    }
  }

  /**
   * 
   */
  static finish(event: PluginEvent) {
    event.source = event.target = null;
  }

  constructor(source: Page, target: Page, msg: Msg, data?: any) {
    if (PageInclude(target)) {
      this.source = source;
      this.target = target;
      this.msg = msg;
      this.data = data;
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
