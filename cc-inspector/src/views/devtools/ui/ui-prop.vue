<template>
  <div class="ui-prop">
    <CCProp :name="name" :icon="icon" :head-width="headWidth" v-model:expand="expand" :arrow="value && value.isArrayOrObject()" :slide="value && value.isNumber()" :indent="indent * 10" @change-expand="onClickFold">
      <div class="prop-value" v-if="value">
        <div v-if="value.isInvalid()" class="invalid">
          {{ formatValue(value.data) }}
        </div>
        <CCInput v-if="value.isString()" v-model:value="value.data" :disabled="value.readonly" @change="onChangeValue"> </CCInput>
        <CCTextarea v-if="value.isText()" v-model:value="value.data" :disabled="value.readonly" @change="onChangeValue"> </CCTextarea>
        <CCInputNumber v-if="value.isNumber()" v-model:value="value.data" :step="step" :disabled="value.readonly" @change="onChangeValue"></CCInputNumber>
        <div v-if="value.isVec2() || value.isVec3() || value.isVec4()" class="vec">
          <UiProp v-for="(vec, index) in value.data" :icon="!!index" head-width="auto" :key="index" :arrow="false" :value="vec.value" :name="vec.name"> </UiProp>
        </div>
        <CCSelect v-if="value.isEnum()" v-model:value="value.data" :disabled="value.readonly" :data="getEnumValues(value)" @change="onChangeValue"> </CCSelect>
        <CCCheckBox v-if="value.isBool()" v-model:value="value.data" :disabled="value.readonly" @change="onChangeValue"> </CCCheckBox>
        <CCColor v-if="value.isColor()" :show-color-text="true" :disabled="value.readonly" v-model:color="value.data" @change="onChangeValue"> </CCColor>
        <PropertyImage v-if="value.isImage()" v-model:data="(value as ImageData)"></PropertyImage>
        <Engine v-if="value.isEngine()" v-model:data="(value as EngineData)"> </Engine>
        <div v-if="value.isObject() && !expand" class="objectDesc">{{ value.data }}</div>
        <div v-if="value.isArray()" class="array">Array[{{ value.data.length }}]</div>
      </div>
    </CCProp>
    <div v-if="value && value.isArrayOrObject()">
      <div v-show="expand && subData">
        <UiProp v-for="(arr, index) in subData" :key="index" :indent="indent + 1" :value="arr.value" :name="getName(value.isArray(), arr)"> </UiProp>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import ccui from "@xuyanfeng/cc-ui";
import { Option } from "@xuyanfeng/cc-ui/types/cc-select/const";
import { defineComponent, onMounted, PropType, ref, toRaw, watch } from "vue";
import { Msg, RequestSetPropertyData } from "../../../core/types";
import { bridge } from "../bridge";
import { Bus, BusMsg } from "../bus";
import { EngineData, EnumData, ImageData, Info, NumberData, Property, StringData, TextData, Vec2Data, Vec3Data } from "../data";
import Engine from "./property-engine.vue";
import PropertyImage from "./property-image.vue";
const { CCInput, CCTextarea, CCProp, CCButton, CCInputNumber, CCSelect, CCCheckBox, CCColor } = ccui.components;
export default defineComponent({
  name: "ui-prop",
  components: { PropertyImage, CCProp, Engine, CCTextarea, CCInput, CCButton, CCInputNumber, CCSelect, CCCheckBox, CCColor },
  props: {
    name: { type: String, default: "" },
    indent: { type: Number, default: 0 },
    icon: { type: Boolean, default: true },
    headWidth: { type: String, default: "120px" },
    arrow: { type: Boolean, default: false },
    step: { type: Number, default: 1 },
    value: {
      type: Object as PropType<Info | EngineData | EnumData | NumberData | StringData | TextData | Vec2Data | Vec3Data | ImageData>,
      default: () => new Info(),
    },
  },
  setup(props, { emit }) {
    const expand = ref(false);
    onMounted(() => {
      expand.value = false;
      if (props.value.isArray()) {
        subData.value = props.value.data;
      } else {
        subData.value = null;
      }
    });
    watch(
      () => props.value,
      (v) => {
        expand.value = false;
        if (v.isArray()) {
          subData.value = v.data;
        } else {
          subData.value = null;
        }
      }
    );
    const subData = ref<Array<Property> | null>(null);

    return {
      expand,
      subData,
      formatValue(data: any) {
        if (data === null) {
          return "null";
        } else if (data === undefined) {
          return "undefined";
        } else if (data === Infinity) {
          return "Infinity";
        } else if (Number.isNaN(data)) {
          return "NaN";
        } else {
          return data;
        }
      },
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

      isImageValid() {
        return !!props.value.data;
      },

      getName(isArray: boolean, arr: Property) {
        if (!arr || !arr.value) {
          // debugger;
          return "xxx";
        }
        const type = arr.value.type;
        if (isArray) {
          return arr.name;
        } else {
          return arr.name;
        }
      },
      onClickFold(v: boolean) {
        if (props.value.isArray()) {
          return;
        }
        const s = toRaw(subData.value);
        const e = toRaw(expand.value);
        const rawValue = toRaw(props.value);
        if (rawValue && rawValue.isObject() && s === null && e === true) {
          // 请求object的item数据
          Bus.emit(BusMsg.RequestObjectData, rawValue, (info: Property[]) => {
            subData.value = info;
          });
        }
      },
      onChangeValue() {
        if (!props.value.readonly) {
          const raw = toRaw(props.value);
          bridge.send(Msg.RequestSetProperty, raw as RequestSetPropertyData);
        }
      },
    };
  },
});
</script>

<style scoped lang="less">
.ui-prop {
  display: flex;
  flex-direction: column;
  justify-content: center;
  .prop-value {
    flex: 3;
    text-align: left;
    overflow: hidden;
    display: flex;
    flex-direction: row;
    align-items: flex-start;

    .invalid {
      user-select: none;
      font-size: 12px;
      color: grey;
    }

    .objectDesc {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      user-select: none;
      font-size: 12px;
      color: #d2d2d2;
    }

    .array {
      display: flex;
      flex-direction: column;
      color: #d2d2d2;
      font-size: 12px;
    }

    .vec {
      width: 100%;
      display: flex;
      flex-direction: row;
      align-items: center;

      .ui-prop {
        flex: 1;
        .cc-prop {
          overflow: hidden;
        }
      }

      // #ui-prop:first-child {
      //   margin-left: 0;
      // }

      // #ui-prop:last-child {
      //   margin-right: 0;
      // }
    }

    .array-object {
      flex: 1;
      max-width: 100%;
      overflow: hidden;
      display: flex;
      flex-direction: row;
      align-items: center;
    }

    .slot {
      display: flex;
      width: 100%;
    }
  }
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
  }
}
</style>
