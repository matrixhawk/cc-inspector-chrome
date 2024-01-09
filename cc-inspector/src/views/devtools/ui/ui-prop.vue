<template>
  <div id="ui-prop">
    <div
      class="normal-data"
      style="
        display: flex;
        flex-direction: row;
        align-items: center;
        min-height: 30px;
        margin: 0;
      "
    >
      <div
        @mousedown="onPropNameMouseDown"
        class="key"
        @click="onClickFold"
        :style="{ cursor: isArrayOrObject() ? 'pointer' : '' }"
      >
        <i
          class="data-arrow"
          v-if="arrow"
          :class="fold ? 'iconfont icon_arrow_right' : 'iconfont icon_arrow_down'"
          :style="{
            visibility: isArrayOrObject() ? 'visible' : 'hidden',
            'margin-left': indent * 10 + 'px',
          }"
        >
        </i>
        <div class="text" ref="propText">
          <!-- 使用CCProp -->
          <!-- <el-popover
            placement="top"
            trigger="hover"
            :disabled="!isShowTooltip()"
          >
            <div>{{ name }}</div>
            <span>{{ name }}</span>
          </el-popover> -->
        </div>
      </div>
      <div class="value">
        <div v-if="value.isInvalid()" class="invalid">
          {{ value.data }}
        </div>
        <CCInput
          v-if="value.isString()"
          v-model="value.data"
          :disabled="value.readonly"
          @change="onChangeValue"
        >
        </CCInput>
        <CCInput
          v-if="value.isText()"
          type="textarea"
          :autosize="{ minRows: 3, maxRows: 5 }"
          placeholder="请输入内容"
          :disabled="value.readonly"
          @change="onChangeValue"
          v-model="value.data"
        >
        </CCInput>
        <CCInputNumber
          v-if="value.isNumber()"
          style="width: 100%; text-align: left"
          v-model="value.data"
          :step="step"
          :disabled="value.readonly"
          @change="onChangeValue"
          controls-position="right"
        ></CCInputNumber>

        <div v-if="value.isVec2() || value.isVec3()" class="vec">
          <ui-prop
            v-for="(vec, index) in value.data"
            :key="index"
            :arrow="false"
            :value="vec.value"
            :name="vec.name"
          >
          </ui-prop>
        </div>
        <CCSelect
          v-model="value.data"
          :disabled="value.readonly"
          :data="getEnumValues(value)"
          v-if="value.isEnum()"
          style="width: 100%"
          @change="onChangeValue"
        >
        </CCSelect>
        <CCCheckBox
          v-model="value.data"
          v-if="value.isBool()"
          :disabled="value.readonly"
          @change="onChangeValue"
        >
        </CCCheckBox>
        <div class="color" v-if="value.isColor()">
          <CCColor
            style="position: absolute"
            :disabled="value.readonly"
            v-model="value.data"
            @change="onChangeValue"
          >
          </CCColor>
          <div class="hex" :style="{ color: colorReverse(value.data) }">
            {{ value.data }}
          </div>
        </div>
        <div v-if="value.isImage()" class="image-property">
          <!-- TODO: 适配 -->
          <div v-if="value.isImage() || true" placement="top" trigger="hover">
            <div
              style="
                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: row;
                align-items: center;
                justify-content: center;
              "
            >
              <img
                :src="value.data"
                alt="图片"
                style="max-width: 100px; max-height: 100px; object-fit: contain"
              />
            </div>
            <img :src="value.data" style="height: 36px" alt="图片" />
          </div>
          <div style="flex: 1; display: flex; flex-direction: row-reverse">
            <CCButton @click="onShowValueInConsole">log</CCButton>
          </div>
        </div>
        <div v-if="value.isEngine()" class="engine">
          <div class="head">
            <i class="icon" :class="getEngineTypeIcon()"></i>
            <div class="type">{{ value["engineType"] }}</div>
          </div>
          <div class="name">{{ value["engineName"] }}</div>
          <CCButton @click="onPlaceInTree" type="primary">
            <i class="iconfont icon_place"></i>
          </CCButton>
        </div>
        <div v-if="value.isObject() && fold" class="objectDesc">
          {{ value.data }}
        </div>
        <div v-if="value.isArray()" class="array">
          Array({{ value.data.length }})
        </div>
        <div class="slot" v-if="false">
          <slot></slot>
        </div>
      </div>
    </div>
    <div v-if="isArrayOrObject()">
      <div
        v-show="!fold && subData"
        style="display: flex; flex-direction: column"
      >
        <ui-prop
          v-for="(arr, index) in subData"
          :key="index"
          :indent="indent + 1"
          :value="arr.value"
          :name="getName(value.isArray(), arr)"
        >
        </ui-prop>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  toRaw,
  watch,
  onUnmounted,
  onMounted,
  PropType,
} from "vue";
import { DataType, EngineData, EnumData, Info, Property } from "../data";
import { connectBackground } from "../connectBackground";
import { Msg } from "../../../core/types";
import Bus, { BusMsg } from "../bus";
import { Option } from "@xuyanfeng/cc-ui/types/cc-select/const";
import ccui from "@xuyanfeng/cc-ui";
const { CCInput, CCButton, CCInputNumber, CCSelect, CCCheckBox, CCColor } =
  ccui.components;

export default defineComponent({
  name: "UiProp",
  components: {
    CCInput,
    CCButton,
    CCInputNumber,
    CCSelect,
    CCCheckBox,
    CCColor,
  },
  props: {
    name: { type: String, default: "" },
    indent: { type: Number, default: 0 },
    arrow: { type: Boolean, default: true },
    step: { type: Number, default: 1 },
    value: {
      type: Object as PropType<Info | EngineData | EnumData>,
      default: () => {},
    },
  },
  setup(props, { emit }) {
    const { value, step } = props;
    const fold = ref(true);
    let clientX: number = 0;
    onMounted(() => {
      watchValue();
    });
    function watchValue() {
      fold.value = true;
      if (value.isArray()) {
        subData.value = value.data;
      } else {
        subData.value = null;
      }
    }
    watch(props.value, () => {
      watchValue();
    });
    const subData = ref<Property[]>([]);
    const propText = ref<HTMLDivElement>();

    function _onMouseMove(event: MouseEvent) {
      let x = event.clientX;
      let calcStep = step || 0;
      if (x > clientX) {
        calcStep = Math.abs(calcStep);
      } else {
        calcStep = -Math.abs(calcStep);
      }
      emit("movestep", calcStep);
      clientX = x;
    }

    function _onMouseUp(event: MouseEvent) {
      document.removeEventListener("mousemove", _onMouseMove);
      document.removeEventListener("mouseup", _onMouseUp);
      document.removeEventListener("onselectstart", _onSelect);
    }
    function _onSelect() {
      return false;
    }
    return {
      fold,
      propText,
      subData,
      getEnumValues(data: any): Option[] {
        const value: EnumData = data;
        const ret: Option[] = [];
        value.values.map((item) => {
          ret.push({
            label: item.name,
            value: item.value,
          });
        });
        return ret;
      },
      isArrayOrObject() {
        return value && (value.isArray() || value.isObject());
      },
      isImageValid() {
        return !!value.data;
      },
      onPlaceInTree() {
        Bus.emit(BusMsg.ShowPlace, value);
      },
      isShowTooltip() {
        const el: HTMLDivElement = propText.value as HTMLDivElement;
        if (el) {
          if (el.scrollWidth > el.offsetWidth) {
            // 出现了省略号
            return true;
          }
        }
        return false;
      },
      getEngineTypeIcon() {
        switch ((value as EngineData).engineType) {
          case "cc_Sprite": {
            return "icon_picture";
          }
          case "cc_Label": {
            return "icon_text";
          }
          case "cc_Node": {
            return "icon_node";
          }
        }
        return "icon_unknown";
      },
      getName(isArray: boolean, arr: Property) {
        const type = arr.value.type;
        if (isArray) {
          return `[${arr.name}]`;
        } else {
          return arr.name;
        }
      },
      onClickFold() {
        if (value.isObject() && fold && !subData) {
          // 请求object的item数据
          Bus.emit(BusMsg.RequestObjectData, value, (info: Property[]) => {
            fold.value = false;
            subData.value = info;
          });
        } else {
          fold.value = !fold.value;
        }
      },
      onShowValueInConsole() {
        if (Array.isArray(value.path)) {
          let uuid = value.path[0];
          let key = value.path[1]; // todo 暂时只支持一级key
          if (uuid && key) {
            chrome.devtools.inspectedWindow.eval(
              `window.CCInspector.logValue('${uuid}','${key}')`
            );
          }
        }
      },
      onChangeValue() {
        if (!value.readonly) {
          connectBackground.postMessageToBackground(Msg.SetProperty, value);
        }
      },
      onPropNameMouseDown(event: MouseEvent) {
        document.addEventListener("mousemove", _onMouseMove);
        document.addEventListener("mouseup", _onMouseUp);
        document.addEventListener("onselectstart", _onSelect);
      },
      colorReverse(OldColorValue: string) {
        OldColorValue = "0x" + OldColorValue.replace(/#/g, "");
        var str = "000000" + (0xffffff - parseInt(OldColorValue)).toString(16);
        return "#" + str.substring(str.length - 6, str.length);
      },
      _onMouseMove,
      _onMouseUp,
      _onSelect,
    };
  },
});
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
        flex: 1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        user-select: none;
        font-size: 12px;
        margin: 3px;

        span {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
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

      .invalid {
        color: grey;
      }

      .objectDesc {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        user-select: none;
      }

      .array {
        display: flex;
        flex-direction: column;
        color: red;
      }

      .engine {
        display: flex;
        flex-direction: row;
        border: solid #409eff 1px;
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
              min-width: 50px;
            }

            .key {
              min-width: unset;
              display: block;
              margin-right: 5px;
              flex: unset;
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
