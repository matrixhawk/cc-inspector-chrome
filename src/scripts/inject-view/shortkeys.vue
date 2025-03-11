<template>
  <div class="shortkeys">
    <CCProp name="Node Pick"> <CCSelect @change="onChangePick" :value="config.shortKeyPick" :data="keyOptions"></CCSelect> </CCProp>
    <CCProp name="Game Pause/Resume"> <CCSelect @change="onChangeGamePauseResume" :value="config.shortKeyGamePauseResume" :data="keyOptions"></CCSelect> </CCProp>
    <CCProp name="Game Step"> <CCSelect @change="onChangeGameStep" :value="config.shortKeyGameStep" :data="keyOptions"></CCSelect> </CCProp>
  </div>
</template>
<script lang="ts">
import ccui from "@xuyanfeng/cc-ui";
import { Option } from "@xuyanfeng/cc-ui/types/cc-select/const";
import { storeToRefs } from "pinia";
import { defineComponent, ref } from "vue";
import { appStore } from "./store";
const { CCButton, CCSelect, CCProp } = ccui.components;
export default defineComponent({
  name: "shortkeys",
  components: { CCButton, CCSelect, CCProp },
  setup(props, { emit }) {
    const { config } = storeToRefs(appStore());
    const keyOptions = ref<Array<Option>>([
      { label: "None", value: "None" },
      { label: "Backquote(`)", value: "Backquote" },
      { label: "Space", value: "Space" },
      { label: "Escape", value: "Escape" },
      { label: "F1", value: "F1" },
      { label: "F2", value: "F2" },
      { label: "F3", value: "F3" },
      { label: "F4", value: "F4" },
      { label: "F5", value: "F5" },
      { label: "F6", value: "F6" },
      { label: "F7", value: "F7" },
      { label: "F8", value: "F8" },
      { label: "F9", value: "F9" },
      { label: "F10", value: "F10" },
      { label: "F11", value: "F11" },
      { label: "F12", value: "F12" },
    ]);

    return {
      config,
      keyOptions,
      onChangePick(v: string) {
        config.value.shortKeyPick = v;
        appStore().save();
      },
      onChangeGameStep(v: string) {
        config.value.shortKeyGameStep = v;
        appStore().save();
      },
      onChangeGamePauseResume(v: string) {
        config.value.shortKeyGamePauseResume = v;
        appStore().save();
      },
    };
  },
});
</script>
<style lang="less" scoped>
.shortkeys {
  background-color: black;
  display: flex;
  flex-direction: column;
}
</style>
