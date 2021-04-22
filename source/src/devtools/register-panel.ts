import * as PluginMsg from '../core/plugin-msg'
import Manifest from '../manifest.json'


if (chrome && chrome.devtools) {
  // 对应的是Elements面板的边栏
  chrome.devtools.panels.elements.createSidebarPane('Cocos', function (sidebar) {
    sidebar.setObject({some_data: "some data to show!"});
  });

  // 和background建立连接
  let connect: chrome.runtime.Port | null = null;
  if (chrome && chrome.runtime) {
    connect = chrome.runtime.connect({name: PluginMsg.Page.DevToolsPanel});
  }


// 创建devtools-panel
  chrome.devtools.panels.create("Cocos", "icons/48.png", Manifest.devtools_page, (panel: chrome.devtools.panels.ExtensionPanel) => {
      console.log("[CC-Inspector] Dev Panel Created!");
      if (!connect) {
        return;
      }
      connect.onDisconnect.addListener(() => {
        console.log(`%c[Connect-Dis]`, 'color:red;')
      })
      connect.onMessage.addListener((event, sender) => {
        console.log(`[Message] ${JSON.stringify(event)}`);
      });

      panel.onShown.addListener((window) => {
        // 面板显示，查询是否是cocos游戏
        console.log("panel show");
        if (connect) {
          connect.postMessage({msg: PluginMsg.Msg.UrlChange, data: {}})
        }
      });
      panel.onHidden.addListener(() => {
        // 面板隐藏
        console.log("panel hide");
      });
      panel.onSearch.addListener(function (action, query) {
        // ctrl+f 查找触发
        if (connect) {
          console.log("panel search!");
        }
      });
    }
  );
}

