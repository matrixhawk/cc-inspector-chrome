<template>
  <div class="settings">
    <settings-prop label="refresh">
      <CCSelect
        v-model="refreshType"
        :data="refreshOptions"
        @change="onCommonSave"
        style="flex: 1"
      >
      </CCSelect>
    </settings-prop>
    <settings-prop label="refresh time: " v-show="isRefreshAuto()">
      <CCInputNumber
        style="flex: 1"
        :min="100"
        v-model="refreshTime"
        @change="onCommonSave"
      ></CCInputNumber>
      <span>ms</span>
    </settings-prop>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, toRaw } from "vue";
import { RefreshType, settings } from "../settings";
import SettingsProp from "./settings-prop.vue";
import { Option } from "@xuyanfeng/cc-ui/types/cc-select/const";
import ccui from "@xuyanfeng/cc-ui";
const { CCInput, CCButton, CCInputNumber, CCSelect, CCCheckBox, CCColor } =
  ccui.components;
export default defineComponent({
  name: "settings",
  components: {
    SettingsProp,
    CCInput,
    CCButton,
    CCInputNumber,
    CCSelect,
    CCCheckBox,
    CCColor,
  },
  props: {},
  setup(props, ctx) {
    const refreshOptions = ref<Array<Option>>([
      { label: "auto", value: RefreshType.Auto },
      { label: "manual", value: RefreshType.Manual },
    ]);
    const refreshType = ref(settings.data?.refreshType || "");
    const refreshTime = ref(settings.data?.refreshTime || 500);
    return {
      refreshType,
      refreshTime,
      refreshOptions,
      isRefreshAuto() {
        return refreshType.value === RefreshType.Auto;
      },
      onChangeRefreshType() {},
      onCommonSave() {
        if (settings.data) {
          settings.data.refreshType = toRaw(refreshType.value);
          settings.data.refreshTime = toRaw(refreshTime.value);
          settings.save();
        }
      },
    };
  },
});
</script>

<style scoped lang="less">
.settings {
}
</style>
