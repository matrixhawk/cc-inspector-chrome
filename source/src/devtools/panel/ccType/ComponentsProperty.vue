<template>
  <div id="app">
    <div>
      <div>
        <h4 @click="onClickComp" style="margin-top: 5px;margin-bottom: 1px;font-weight: bold;cursor: pointer">挂载组件:</h4>
        <hr style="margin-bottom: 2px;margin-top: 2px;"/>
      </div>
      <div v-show="isShowComp">
        <ui-prop :name="index" track-by="$index" v-for="(comp,index) in components" :key="index">
          <span>{{ comp.type }}</span>
        </ui-prop>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue"
import {Component, Prop} from "vue-property-decorator";

@Component({})
export default class ComponentsProperty extends Vue {
  name: string = "";
  isShowComp: boolean = true;

  onClickComp() {
    this.isShowComp = !this.isShowComp;
  }

  @Prop()
  components = ""
}
</script>

<style scoped>
span {
  color: #fd942b;
}
</style>
