<template>
  <div id="ui-prop">
    <div class="normal-data" style="display: flex;flex-direction: row;align-items: center;min-height: 30px;margin: 0;">
      <div @mousedown="onPropNameMouseDown" class="key"
           @click="onClickFold"
           :style="{'cursor':isArrayOrObject()?'pointer':''}"
      >
        <i class="data-arrow"
           v-if="arrow"
           :class="fold?'el-icon-caret-right':'el-icon-caret-bottom'"
           :style="{'visibility':isArrayOrObject()?'visible':'hidden','margin-left':indent*10+'px'}">
        </i>
        <div class="text">{{ name }}</div>
      </div>
      <div class="value">
        <el-input v-if="isString()" v-model="value.data"
                  :disabled="value.readonly"
                  @change="onChangeValue">
        </el-input>
        <el-input v-if="isText()"
                  type="textarea"
                  :autosize="{minRows:3,maxRows:5}"
                  placeholder="请输入内容"
                  :disabled="value.readonly"
                  @change="onChangeValue"
                  v-model="value.data">
        </el-input>
        <el-input-number v-if="isNumber()"
                         style="width: 100%;text-align: left"
                         v-model="value.data"
                         :step="step"
                         :disabled="value.readonly"
                         @change="onChangeValue"
                         controls-position="right"
        ></el-input-number>

        <div v-if="isVec2()||isVec3()" class="vec">
          <ui-prop v-for="(vec, index) in value.data"
                   :key="index"
                   :arrow="false"
                   :value="vec.value"
                   :name="vec.name">

          </ui-prop>
        </div>
        <el-select v-model="value.data"
                   :disabled="value.readonly"
                   v-if="isEnum()" style="width: 100%;"
                   @change="onChangeValue">
          <el-option v-for="(opt, index) in value.values"
                     :key="index"
                     :label="opt.name"
                     :value="opt.value">
          </el-option>
        </el-select>
        <el-checkbox v-model="value.data"
                     v-if="isBool()"
                     :disabled="value.readonly"
                     @change="onChangeValue">
        </el-checkbox>
        <div class="color" v-if="isColor()">
          <el-color-picker style="position: absolute;"
                           :disabled="value.readonly"
                           v-model="value.data" @change="onChangeValue">
          </el-color-picker>
          <div class="hex" :style="{color:colorReverse(value.data)}">{{ value.data }}</div>
        </div>
        <div v-if="isArray()" style="display: flex;flex-direction: column;">
          {{ value.data.length }}
        </div>
        <!--      <div v-if="isArrayOrObject()" class="array-object">-->
        <!--        <div class="text">-->
        <!--          {{ valueString() }}-->
        <!--        </div>-->
        <!--        <el-button @click="onShowValueInConsole">log</el-button>-->
        <!--      </div>-->
        <div v-if="isImage()" class="image-property">
          <el-popover v-if="isImage()" placement="top" trigger="hover">
            <div
                style="width: 100%;height: 100%;display: flex;flex-direction: row;align-items: center;justify-content: center;">
              <img :src="value.data" alt="图片" style="max-width: 100px;max-height: 100px;object-fit: contain;">
            </div>
            <img :src="value.data" slot="reference" style="height: 36px;" alt="图片">
          </el-popover>
          <div style="flex:1;display: flex; flex-direction: row-reverse;">
            <el-button @click="onShowValueInConsole">log</el-button>
          </div>
        </div>
        <div v-if="isEngine()" class="engine">
          <div class="head">
            <i class="icon" :class="getEngineTypeIcon()"></i>
            <div class="type">{{ value.engineType }}</div>
          </div>
          <div class="name">{{ value.engineName }}</div>
          <el-button @click="onPlaceInTree" type="primary" icon="el-icon-place"></el-button>
        </div>
        <div class="slot">
          <slot></slot>
        </div>
      </div>
    </div>
    <div v-if="isArrayOrObject()">
      <div v-show="!fold" style="display: flex;flex-direction: column;">
        <ui-prop v-for="(arr,index) in value.data"
                 :key="index"
                 :indent="indent+1"
                 :value="arr.value"
                 :name="getName(isArray(),arr)"
        >
        </ui-prop>
      </div>
    </div>
  </div>
</template>

<script lang="ts">

import Vue from "vue"
import {Component, Prop} from "vue-property-decorator"
import {DataType, Info, EngineData} from './data'
import {connectBackground} from "@/devtools/connectBackground";
import {Msg} from "@/core/types";
import Bus, {BusMsg} from './bus'

@Component({
  components: {}
})
export default class UiProp extends Vue {
  @Prop({default: ""})
  name: string | undefined;

  @Prop({default: 0})
  indent!: number;

  @Prop({default: true})
  arrow!: boolean;

  @Prop()
  value!: Info;

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

  isArrayOrObject() {
    return this.value && (this.value.type === DataType.Array || this.value.type === DataType.Object)
  }

  isObject() {
    return this.value && (this.value.type === DataType.Object)
  }

  isArray() {
    return this.value && (this.value.type === DataType.Array)
  }

  isImage() {
    return this.value && (this.value.type === DataType.Image)
  }

  isEngine() {
    return this.value && (this.value.type === DataType.Engine)
  }

  onPlaceInTree() {
    Bus.$emit(BusMsg.ShowPlace, this.value);
  }

  created() {
  }

  getEngineTypeIcon() {
    const value = this.value as EngineData;
    switch (value.engineType) {
      case 'cc_Sprite': {
        return 'el-icon-picture-outline';
      }
      case 'cc_Label': {
        return 'el-icon-third-text';
      }
      case 'cc_Node': {
        return 'el-icon-third-node'
      }
    }
    return 'el-icon-third-unknow';
  }

  getName(isArray: boolean, arr: UiProp) {
    const type = arr.value.type;
    if (isArray) {
      return `[${arr.name}]`
    } else {
      return arr.name;
    }
  }

  private fold = false;

  onClickFold() {
    this.fold = !this.fold;
  }

  valueString() {
    try {
      return JSON.stringify(this.value.data)
    } catch (e) {
      return ''
    }
  }

  onShowValueInConsole() {
    if (Array.isArray(this.value.path)) {
      let uuid = this.value.path[0];
      let key = this.value.path[1]; // todo 暂时只支持一级key
      if (uuid && key) {
        chrome.devtools.inspectedWindow.eval(`window.CCInspector.logValue('${uuid}','${key}')`)
      }
    }
  }

  onChangeValue() {
    if (!this.value.readonly) {
      connectBackground.postMessageToBackground(Msg.SetProperty, this.value);
    }
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
  min-height: 30px;
  margin: 1px 0;
  display: flex;
  flex-direction: column;
  justify-content: center;

  .normal-data {
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
      min-width: 90px;

      .data-arrow {
        width: 20px;
        height: 16px;
        font-size: 16px;
        cursor: pointer;
      }

      .text {
        user-select: none;
        font-size: 12px;
        margin: 3px;
      }
    }

    .value {
      flex: 3;
      text-align: left;
      height: 100%;
      overflow: hidden;
      min-width: 400px;

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

      .engine {
        display: flex;
        flex-direction: row;
        border: solid #409EFF 1px;
        border-radius: 5px;
        align-items: center;
        align-content: center;

        .head {
          background-color: cornflowerblue;
          height: 28px;
          align-items: center;
          align-content: center;
          display: flex;
          flex-direction: row;

          .icon {
            font-size: 20px;
            width: 20px;
            margin-left: 5px;
          }

          .type {
            display: flex;
            align-content: center;
            align-items: center;
            margin: 0 5px;
          }
        }


        .name {
          flex: 1;
          height: 28px;
          padding-left: 5px;
          background-color: gold;
          display: flex;
          align-items: center;
          align-content: center;
        }
      }

      .vec {
        width: 100%;
        display: flex;
        flex-direction: row;
        align-items: center;

        #ui-prop {
          margin: 0 10px;
          flex: 1;

          .normal-data {
            .value {
              min-width: 100px;
            }

            .key {
              min-width: unset;
              display: block;
              margin-right: 5px;
              flex: unset;

              .text {
              }
            }
          }
        }

        #ui-prop:first-child {
          margin-left: 0;
        }

        #ui-prop:last-child {
          margin-right: 0;
        }
      }

      .array-object {
        flex: 1;
        max-width: 100%;
        overflow: hidden;
        display: flex;
        flex-direction: row;
        align-items: center;

        .text {
          flex: 1;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }
      }

      .image-property {
        display: flex;
        flex-direction: row;
        align-content: center;
        align-items: center;
        height: 36px;
      }

      .slot {
        display: flex;
        width: 100%;
      }
    }
  }
}
</style>
