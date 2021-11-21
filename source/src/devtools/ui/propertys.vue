<template>
  <div id="prop">
    <property-group v-for="(group, index) in data.group" :key="index" :group="group"></property-group>
  </div>
</template>

<script lang="ts">
import Vue from "vue"

import {Component, Prop, Watch} from "vue-property-decorator"
import UiProp from "./ui-prop.vue"
import {Group, NodeInfoData} from "@/devtools/data";
import PropertyGroup from "@/devtools/ui/property-group.vue";

@Component({
  components: {PropertyGroup, UiProp},
})
export default class properties extends Vue {
  @Prop({
    default: () => {
      return {};
    }
  })
  data!: NodeInfoData;


  @Watch("data")
  watchData(newValue: NodeInfoData, oldValue: NodeInfoData) {
  }

  created() {
  }


  _evalCode(code: string) {
    if (chrome && chrome.devtools) {
      chrome.devtools.inspectedWindow.eval(code);
    } else {
      console.log(code);
    }
  }
}
</script>

<style scoped lang="less">
#prop {

}
</style>
