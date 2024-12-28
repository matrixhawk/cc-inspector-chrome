<template>
  <div class="property-engine">
    <i class="icon iconfont" :class="getEngineTypeIcon()"></i>
    <div class="type">{{ data.engineType }}</div>
    <div class="name">{{ data.engineName }}</div>
    <div class="place" @click="onPlaceInTree">
      <i class="iconfont icon_place"></i>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { Bus, BusMsg } from "../bus";
import { EngineData } from "../data";
export default defineComponent({
  name: "property-engine",
  components: {},
  props: {
    data: {
      type: Object as PropType<EngineData>,
      default: () => new EngineData(),
    },
  },
  setup(props, context) {
    return {
      onPlaceInTree() {
        Bus.emit(BusMsg.ShowPlace, props.data);
      },
      getEngineTypeIcon() {
        switch (props.data.engineType) {
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
    };
  },
});
</script>

<style scoped lang="less">
@my-height: 20px;
.property-engine {
  height: @my-height;
  box-sizing: border-box;
  flex: 1;
  display: flex;
  flex-direction: row;
  border: solid #409eff 1px;
  border-radius: 3px;
  align-items: center;
  align-content: center;
  background-color: cornflowerblue;
  height: @my-height;
  align-items: center;
  align-content: center;
  display: flex;
  flex-direction: row;

  .icon {
    font-size: 14px;
    width: @my-height;
    margin: 0 5px;
  }

  .type {
    text-align: left;
    flex: 1;
    color: white;
    font-size: 12px;
    display: flex;
    align-content: center;
    height: @my-height;
    padding: 0 5px;
    background-color: rgb(48, 158, 0);
    align-items: center;
  }

  .name {
    font-size: 12px;
    color: white;
    flex: 1;
    height: @my-height;
    background-color: rgb(184, 157, 5);
    display: flex;
    padding: 0 5px;
    align-items: center;
    align-content: center;
  }
  .place {
    padding: 0 5px;
    cursor: pointer;
    &:hover {
      color: #6d6d6d;
    }
    &:active {
      color: #000000;
    }
  }
}
</style>
