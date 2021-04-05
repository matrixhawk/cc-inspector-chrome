import * as PluginMsg from '../core/plugin-msg'
import Manifest from '../manifest.json'


if (chrome && chrome.devtools) {
  // 对应的是Elements面板的边栏
  chrome.devtools.panels.elements.createSidebarPane('Cocos', function (sidebar) {
    sidebar.setObject({some_data: "some data to show!"});
  });
// 创建devtools-panel
  chrome.devtools.panels.create("Cocos", "icons/48.png", Manifest.devtools_page, (panel: chrome.devtools.panels.ExtensionPanel) => {
      console.log("[CC-Inspector] Dev Panel Created!");
      let conn = chrome.runtime.connect({name: PluginMsg.Page.DevToolsPanel});
      conn.onMessage.addListener((event, sender) => {
        console.log(`[Message] ${JSON.stringify(event)}`);
      });

      panel.onShown.addListener((window) => {
        console.log("panel show");
        conn.postMessage({msg: PluginMsg.Msg.UrlChange, data: {}})
      });
      panel.onHidden.addListener(() => {
        console.log("panel hide");
      });
      panel.onSearch.addListener(function (action, query) {
        console.log("panel search!");
      });
    }
  );
}

