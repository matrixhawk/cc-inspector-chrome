<template>
  <div id="prop">
    <div v-for="(group, index) in data.group" :key="index" class="group">
      <div class="header" @click="onClickHeader(group)">
        <div style="margin: 0 5px;">
          <i v-if="group.fold" class="el-icon-caret-right"></i>
          <i v-if="!group.fold" class="el-icon-caret-bottom"></i>
        </div>
        {{ group.name }}
      </div>
      <div class="content" v-show="!group.fold">
        <ui-prop v-for="(item, index) in group.data" :key="index"
                 :name="item.name" :value="item.value">
        </ui-prop>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue"

import {Component, Prop, Watch} from "vue-property-decorator"
import UiProp from "./ui-prop.vue"
import {NodeInfoData} from "@/devtools/data";

@Component({
  components: {UiProp},
})
export default class properties extends Vue {
  @Prop({
    default: () => {
      return {};
    }
  })
  data!: NodeInfoData;

  onClickHeader(group: any) {
    if (group && group.hasOwnProperty("fold")) {
      group.fold = !group.fold;
    }
  }

  @Watch("data")
  watchData(oldValue: NodeInfoData, newValue: NodeInfoData) {
    this._initValue(oldValue.uuid === newValue.uuid);
  }

  created() {
    this._initValue();
  }

  _initValue(isSameNode = true) {
    if (this.data.group) {
      // 第一个cc.Node不折叠
      for (let i = 0; i < this.data.group.length; i++) {
        let item = this.data.group[i];
        this.$set(item, "fold", i !== 0);
      }
    }
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
  .group {
    .header {
      height: 40px;
      display: flex;
      flex-direction: row;
      align-items: center;
      user-select: none;
      cursor: pointer;
      border-bottom: 1px #6d6d6d solid;
      background-color: #1da1f7;
    }

    .header:hover {
      color: #6d6d6d;
    }

    .content {
      padding: 0 5px;
    }
  }
}
</style>
