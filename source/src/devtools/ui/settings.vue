<template>
  <div class="settings">
    <settings-prop label="refresh">
      <el-select v-model="refreshType" @change="onCommonSave" style="flex:1;">
        <el-option v-for="item in refreshOptions" :key="item.value" :label="item.label" :value="item.value">
        </el-option>
      </el-select>
    </settings-prop>
    <settings-prop label="refresh time: " v-show="isRefreshAuto()">
      <el-input-number style="flex:1;" :min=100 v-model="refreshTime" @change="onCommonSave"></el-input-number>
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
import Vue from "vue";
import Component from "vue-class-component";
import {Prop} from "vue-property-decorator";
import {RefreshAuto, RefreshManual, settings} from "@/devtools/settings";
import SettingsProp from "@/devtools/ui/settings-prop.vue";


@Component({
  name: "Settings",
  components: {SettingsProp}
})
export default class Settings extends Vue {
  name: string = "settings";
  refreshOptions = [
    {label: "auto", value: RefreshAuto},
    {label: "manual", value: RefreshManual}
  ]
  refreshType = "";
  refreshTime = 100;

  isRefreshAuto() {
    return this.refreshType === RefreshAuto;
  }

  created() {
    this.refreshType = settings.data?.refreshType || "";
    this.refreshTime = settings.data?.refreshTime || 100;
  }

  onChangeRefreshType() {

  }

  onCommonSave() {
    if (settings.data) {
      settings.data.refreshType = this.refreshType;
      settings.data.refreshTime = this.refreshTime;
      settings.save();
    }
  }

  mounted() {
  }
}
</script>

<style scoped lang="less">
.settings {

}
</style>
