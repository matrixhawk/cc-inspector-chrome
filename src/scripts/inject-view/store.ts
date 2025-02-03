import { ref, toRaw } from "vue";
import { defineStore } from "pinia";
import profile from "cc-plugin/src/ccp/profile";
import pluginConfig from "../../../cc-plugin.config";
export class ConfigData {
  /**
   * 用户拖动的位置
   */
  pos: number = 0;
  /**
   * 是否自动隐藏
   */
  autoHide: boolean = true;
  /**
   * 是否只拾取顶部元素
   */
  pickTop: boolean = true;
}

export const appStore = defineStore("app", () => {
  const config = ref<ConfigData>(new ConfigData());
  return {
    config,
    init() {
      profile.init(new ConfigData(), pluginConfig);
      const data = profile.load(`${pluginConfig.manifest.name}-assistant.json`) as ConfigData;
      config.value.autoHide = data.autoHide;
      config.value.pos = data.pos;
      config.value.pickTop = data.pickTop;
    },
    save() {
      const cfg = toRaw(config.value);
      profile.save(cfg);
    },
  };
});
