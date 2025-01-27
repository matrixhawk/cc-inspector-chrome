import { TabInfo } from "./tabInfo";

export class TabMgr {
  /**
   * chrome打开的所有标签页面
   */
  public tabArray: TabInfo[] = [];
  public findTab(id: number): TabInfo | null {
    return this.tabArray.find((el) => el.tabID === id) || null;
  }

  addTab(tab: chrome.tabs.Tab, port: chrome.runtime.Port) {
    let tabInfo = this.findTab(tab.id);
    if (!tabInfo) {
      tabInfo = new TabInfo(tab.id);
      this.tabArray.push(tabInfo);
    }
    tabInfo.addContent(tab, port);
  }
}
export const tabMgr = new TabMgr();
