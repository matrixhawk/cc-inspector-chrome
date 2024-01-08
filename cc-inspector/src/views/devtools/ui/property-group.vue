<template>
  <div class="property-group">
    <div class="header" @click="onClickHeader"
         @mouseenter="showLogBtn=true"
         @mouseleave="showLogBtn=false">
      <div style="margin: 0 5px;">
        <i v-if="fold" class="el-icon-caret-right"></i>
        <i v-if="!fold" class="el-icon-caret-bottom"></i>
      </div>
      <div style="flex:1;">
        {{ group.name }}
      </div>
      <el-button style="margin-right: 10px;"
                 v-show="showLogBtn"
                 type="success" icon="el-icon-chat-dot-round" @click.stop="onLog">
      </el-button>
    </div>
    <div class="content" v-show="!fold">
      <ui-prop v-for="(item, index) in group.data" :key="index"
               :name="item.name" :value="item.value">
      </ui-prop>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import {Prop} from "vue-property-decorator";
import {Group} from "@/devtools/data";
import UiProp from "@/devtools/ui/ui-prop.vue";
import Bus, {BusMsg} from "@/devtools/bus";

@Component({
  name: "property-group",
  components: {UiProp}
})
export default class PropertyGroup extends Vue {
  private fold = false;
  private showLogBtn = false;
  @Prop({
    default: () => {
      return new Group("test")
    }
  })
  group!: Group;

  created() {
    Bus.$on(BusMsg.FoldAllGroup, (b: boolean) => {
      this.fold = b;
    })
  }

  mounted() {
  }

  onLog() {
    Bus.$emit(BusMsg.LogData, [this.group.id]);
  }

  onClickHeader() {
    this.fold = !this.fold;
  }
}
</script>

<style scoped lang="less">
.property-group {
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
</style>
