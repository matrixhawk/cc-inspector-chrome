export const Page = {
  Inject: "Inject",
  Devtools: "Devtools",
  Content: "Content",
  Popup: "Popup",
  Options: "Options",
}
export const Msg = {
  NodeInfo: "node-info",// 具体的节点信息
  TreeInfo: "tree-info",// 节点树信息
  Support: "game-support",// 游戏支持信息
  MemoryInfo: "memory-info",//
  TabsInfo: "tabs_info", // 当前页面信息
  UrlChange: "url_change", // 网址发生变化
  SetProperty: "set-property", // 设置node属性
}

export function MsgInclude(msg: string) {
  for (let key in Msg) {
    if (Msg.hasOwnProperty(key)) {
      //@ts-ignore
      let m = Msg[key] as string;
      if (m === msg) {
        return true
      }
    }
  }
  return false;
}
