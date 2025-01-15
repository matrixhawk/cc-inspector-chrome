import CCP from "cc-plugin/src/ccp/entry-render";

export function init() {
  if (chrome && chrome.devtools) {
    // 对应的是Elements面板的边栏
    chrome.devtools.panels.elements.createSidebarPane(CCP.manifest.name, function (sidebar) {
      sidebar.setObject({ some_data: "some data to show!" });
    });
  }
}
