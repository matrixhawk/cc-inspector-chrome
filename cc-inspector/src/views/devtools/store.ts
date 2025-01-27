import profile from "cc-plugin/src/ccp/profile";
import { defineStore } from "pinia";
import { ref, toRaw } from "vue";
import pluginConfig from "../../../cc-plugin.config";
import { PanelMsg } from "./const";
export const enum RefreshType {
  Auto = "auto",
  Manual = "manual",
}
export class ConfigData {
  /**
   * 刷新类型
   */
  refreshType: string = RefreshType.Manual;
  /**
   * 刷新间隔时间，单位ms
   */
  refreshTime: number = 500;
  /**
   * 展开测试的section
   */
  expandTest: boolean = false;
  /**
   * 是否自动刷新inspector
   */
  refreshInspector: boolean = true;
  /**
   * 是否自动刷新hierarchy
   */
  refreshHirarchy: boolean = true;
}

export const appStore = defineStore("app", () => {
  const config = ref<ConfigData>(new ConfigData());
  const frameID = ref<number>(0);
  const pageShow = ref<boolean>(false);

  function readConfigFile(file: string) {
    const data = profile.load(file) as ConfigData;
    config.value.refreshType = data.refreshType || RefreshType.Manual;
    config.value.refreshTime = data.refreshTime || 500;
    config.value.expandTest = !!data.expandTest;
    config.value.refreshHirarchy = !!data.refreshHirarchy;
    config.value.refreshInspector = !!data.refreshInspector;
  }
  return {
    frameID,
    pageShow,
    config,
    init() {
      profile.init(new ConfigData(), pluginConfig);
      if (chrome.devtools) {
        window.addEventListener(PanelMsg.Show, () => {
          pageShow.value = true;
        });
        chrome.devtools.inspectedWindow.eval("window.location.href", (url: string, ex: chrome.devtools.inspectedWindow.EvaluationExceptionInfo) => {
          readConfigFile(url);
        });
      } else {
        pageShow.value = true;
        readConfigFile(`${pluginConfig.manifest.name}.json`);
      }
    },
    save() {
      const cfg = toRaw(config.value);
      profile.save(cfg);
    },
  };
});
