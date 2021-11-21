<template>
  <div class="property-group">
    <div class="header" @click="onClickHeader">
      <div style="margin: 0 5px;">
        <i v-if="fold" class="el-icon-caret-right"></i>
        <i v-if="!fold" class="el-icon-caret-bottom"></i>
      </div>
      {{ group.name }}
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

@Component({
  name: "property-group",
  components: {UiProp}
})
export default class PropertyGroup extends Vue {
  private fold = false;
  @Prop({
    default: () => {
      return new Group('test')
    }
  })
  group!: Group;

  created() {
  }

  mounted() {
  }

  onClickHeader(group: any) {
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
