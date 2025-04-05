import profile from "cc-plugin/src/ccp/profile";
import { defineStore } from "pinia";
import { ref, toRaw } from "vue";
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
  shortKeyPick: string = "Escape";
  shortKeyGameStep: string = "F8";
  shortKeyGamePauseResume: string = "Space";
  shortKeyGameFresh: string = "F1";
}

export const appStore = defineStore("app", () => {
  const config = ref<ConfigData>(new ConfigData());
  return {
    config,
    init() {
      profile.Adaptation.init(pluginConfig);
      profile.init(new ConfigData(), pluginConfig);
      const data = profile.load(`${pluginConfig.manifest.name}-assistant.json`) as ConfigData;
      config.value.autoHide = data.autoHide;
      config.value.pos = data.pos;
      config.value.pickTop = data.pickTop;
      config.value.shortKeyPick = data.shortKeyPick;
      config.value.shortKeyGameStep = data.shortKeyGameStep;
      config.value.shortKeyGamePauseResume = data.shortKeyGamePauseResume;
      config.value.shortKeyGameFresh = data.shortKeyGameFresh;
    },
    save() {
      const cfg = toRaw(config.value);
      profile.save(cfg);
    },
  };
});
