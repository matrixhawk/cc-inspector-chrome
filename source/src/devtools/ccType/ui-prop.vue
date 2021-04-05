<template>
  <div id="ui-prop">
    <div @mousedown="onPropNameMouseDown" class="key">
      <div class="text">{{ name }}</div>
    </div>
    <div class="value">
      <el-input v-if="isString()" v-model="value.data"></el-input>
      <el-input v-if="isText()"
                type="textarea"
                :autosize="{minRows:3,maxRows:5}"
                placeholder="请输入内容"

                v-model="value.data">
      </el-input>
      <el-input-number v-if="isNumber()"
                       style="width: 100%;text-align: left"
                       v-model="value.data"
                       :step="step"
                       controls-position="right"
      ></el-input-number>

      <div v-if="isVec2()||isVec3()" class="vec">
        <ui-prop v-for="(vec, index) in value.data"
                 :key="index"
                 :value="vec.value"
                 :name="vec.name">

        </ui-prop>
      </div>
      <el-select v-model="value.data" v-if="isEnum()" style="width: 100%;">
        <el-option v-for="(opt, index) in value.values"
                   :key="index"
                   :label="opt.name"
                   :value="opt.value">
        </el-option>
      </el-select>
      <el-checkbox v-model="value.data" v-if="isBool()"></el-checkbox>
      <div class="color" v-if="isColor()">
        <el-color-picker style="position: absolute;" v-model="value.data"></el-color-picker>
        <div class="hex" :style="{color:colorReverse(value.data)}">{{ value.data }}</div>
      </div>
      <div class="slot">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script lang="ts">

import Vue from "vue"
import {Component, Prop} from "vue-property-decorator"
import {DataType} from '../data'

@Component({
  components: {}
})
// todo 支持array
export default class UiProp extends Vue {
  @Prop({default: ""})
  name: string | undefined;


  @Prop()
  value: Record<string, any> | undefined | any;

  isString() {
    return this.value && (this.value.type === DataType.String);
  }

  isText() {
    return this.value && (this.value.type === DataType.Text);
  }

  isNumber() {
    return this.value && (this.value.type === DataType.Number);
  }

  isVec2() {
    return this.value && (this.value.type === DataType.Vec2);
  }

  isVec3() {
    return this.value && (this.value.type === DataType.Vec3);
  }

  isEnum() {
    return this.value && (this.value.type === DataType.Enum);
  }

  isBool() {
    return this.value && (this.value.type === DataType.Bool);
  }

  isColor() {
    return this.value && (this.value.type === DataType.Color);
  }

  created() {
  }

  @Prop({default: 1})
  step: number | undefined;


  clientX: number = 0;

  onPropNameMouseDown(event: MouseEvent) {
    document.addEventListener("mousemove", this._onMouseMove);
    document.addEventListener("mouseup", this._onMouseUp);
    document.addEventListener("onselectstart", this._onSelect);
  }

  colorReverse(OldColorValue: string) {
    OldColorValue = "0x" + OldColorValue.replace(/#/g, "");
    var str = "000000" + (0xFFFFFF - parseInt(OldColorValue)).toString(16);
    return '#' + str.substring(str.length - 6, str.length);
  }

  _onSelect() {
    return false;
  }

  _onMouseMove(event: MouseEvent) {
    let x = event.clientX;
    let calcStep = this.step || 0;
    if (x > this.clientX) {
      calcStep = Math.abs(calcStep);
    } else {
      calcStep = -Math.abs(calcStep);
    }
    this.$emit("movestep", calcStep);
    this.clientX = x;
  }

  _onMouseUp(event: MouseEvent) {
    document.removeEventListener("mousemove", this._onMouseMove);
    document.removeEventListener("mouseup", this._onMouseUp);
    document.removeEventListener("onselectstart", this._onSelect);
  }


};
</script>

<style scoped lang="less">
#ui-prop {
  margin: 0;
  min-height: 30px;
  overflow: hidden;
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;


  .key {
    flex: 1;
    float: left;
    text-align: left;
    display: flex;
    flex-direction: row;
    align-items: center;

    .text {
      user-select: none;
      line-height: 30px;
      font-size: 12px;
      margin: 3px;
    }
  }

  .value {
    flex: 3;
    text-align: left;
    height: 100%;

    .color {
      position: relative;
      height: 30px;

      .hex {
        line-height: 30px;
        position: relative;
        text-align: center;
        user-select: none;
        pointer-events: none;
      }
    }

    .vec {
      width: 100%;
      display: flex;
      flex-direction: row;
      align-items: center;

      #ui-prop {
        margin-top: 0;
        margin-bottom: 0;
        margin-right: 20px;
      }

      #ui-prop:last-child {
        margin-right: 0;
      }
    }

    .slot {
      display: flex;
      width: 100%;
    }
  }
}
</style>
