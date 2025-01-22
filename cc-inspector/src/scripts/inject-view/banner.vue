<template>
  <div v-if="data" class="banner" :class="ani" @click="onClick" :title="data.tip" :style="getStyle()">
    <div class="text">
      <span v-if="data.name">
        {{ data.name }}
      </span>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, onMounted, onUnmounted, PropType, ref, toRaw } from "vue";
import { GA_EventName } from "../../ga/type";
import { emitter, Msg } from "./const";
import { AdItem } from "./loader";
import { ga } from "./util";
export default defineComponent({
  name: "banner",
  props: {
    data: {
      type: Object as PropType<AdItem>,
      default: () => new AdItem(),
    },
  },
  setup(props, { emit }) {
    function chageAd(v: AdItem) {
      console.log("show ad: ", JSON.stringify(v));
    }

    onMounted(() => {
      emitter.on(Msg.ChangeAd, chageAd);
    });
    onUnmounted(() => {
      emitter.off(Msg.ChangeAd, chageAd);
    });
    const ani = ref("");
    return {
      ani,
      getStyle() {
        const img = props.data.img;
        if (img) {
          return `background-image: url(${img})`;
        } else {
          return "";
        }
      },
      onClick() {
        const url = toRaw(props.data.store);
        if (url) {
          window.open(url);
          ga(GA_EventName.ClickPluginLink, url);
        }
      },
    };
  },
});
</script>

<style scoped lang="less">
@keyframes flip-out {
  0% {
    transform: rotateX(0);
  }
  100% {
    transform: rotateX(90deg);
  }
}
@keyframes flip-in {
  0% {
    transform: rotateX(90deg);
  }
  100% {
    transform: rotateX(0);
  }
}
.banner-out {
  animation: flip-out 0.4s cubic-bezier(0.455, 0.03, 0.515, 0.955) both;
}
.banner-in {
  animation: flip-in 0.4s cubic-bezier(0.455, 0.03, 0.515, 0.955) both;
}
.banner {
  border: 2px solid #d2d2d2;
  border-bottom: 0;
  background-color: #ffffff;
  overflow: hidden;
  min-width: 300px;
  max-width: 300px;
  min-height: 50px;
  max-height: 50px;
  margin: 0;
  cursor: pointer;
  display: flex;
  text-align: center;
  align-items: flex-end;

  &:hover {
    border: 2px solid #949494;
    border-bottom: 0;
    background-color: #d1d1d1;
  }
  .text {
    user-select: none;
    flex: 1;
    padding-bottom: 2px;
    font-size: 13px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    span {
      color: #000000c4;
      background-color: #afafaf6b;
      padding: 1px 4px;
      border-top-left-radius: 5px;
      border-top-right-radius: 5px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}
</style>
