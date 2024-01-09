<template>
  <div class="settings">
    <settings-prop label="refresh">
      <el-select v-model="refreshType" @change="onCommonSave" style="flex: 1">
        <el-option
          v-for="item in refreshOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        >
        </el-option>
      </el-select>
    </settings-prop>
    <settings-prop label="refresh time: " v-show="isRefreshAuto()">
      <el-input-number
        style="flex: 1"
        :min="100"
        v-model="refreshTime"
        @change="onCommonSave"
      ></el-input-number>
      <span>ms</span>
    </settings-prop>

    <!--        <el-dropdown>-->
    <!--          <span>refresh</span>-->
    <!--          <el-dropdown-menu slot="dropdown">-->
    <!--            <el-dropdown-item>auto</el-dropdown-item>-->
    <!--            <el-dropdown-item>Manual</el-dropdown-item>-->
    <!--          </el-dropdown-menu>-->
    <!--        </el-dropdown>-->
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, toRaw } from "vue";
import { RefreshType, settings } from "../settings";
import SettingsProp from "./settings-prop.vue";

export default defineComponent({
  name: "settings",
  components: { SettingsProp },
  props: {},
  setup(props, ctx) {
    const refreshOptions = ref<Array<{ label: string; value: RefreshType }>>([
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
