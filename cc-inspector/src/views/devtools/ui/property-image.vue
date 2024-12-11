<template>
  <div v-if="data.isImage()" class="property-image">
    <div class="box">
      <img :src="data.data" alt="图片" class="img" />
    </div>

    <div class="url" :title="data.data">{{ data.data }}</div>
    <div style="flex: 1"></div>
    <i class="print iconfont icon_print" @click="onShowValueInConsole"></i>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { ImageData } from "../data";

export default defineComponent({
  name: "property-image",
  props: {
    data: {
      type: Object as PropType<ImageData>,
      default: () => new ImageData().test(),
    },
  },
  setup(props) {
    return {
      onShowValueInConsole() {
        if (Array.isArray(props.data.path)) {
          let uuid = props.data.path[0];
          let key = props.data.path[1]; // todo 暂时只支持一级key
          if (uuid && key) {
            chrome.devtools.inspectedWindow.eval(`window.CCInspector.logValue('${uuid}','${key}')`);
          }
        }
      },
    };
  },
});
</script>

<style scoped lang="less">
.property-image {
  display: flex;
  overflow: hidden;
  flex: 1;
  flex-direction: row;
  align-content: center;
  align-items: center;
  height: 30px;
  .box {
    display: flex;
    flex-direction: row;
    align-items: center;
    min-width: 80px;
    width: 80px;
    justify-content: center;
    .img {
      height: 30px;
      width: 30px;
      object-fit: contain;
    }
  }

  .url {
    color: white;
    font-weight: normal;
    font-size: 12px;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .print {
    cursor: pointer;
    margin-right: 10px;
    color: #d2d2d2;
    &:hover {
      color: #ffffff;
    }
    &:active {
      color: #ffaa00;
    }
  }
}
</style>
