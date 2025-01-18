<template>
  <div v-if="data" class="banner" :class="ani" @click="onClick" :title="data.tip">
    <div class="text">{{ data.name }}</div>
  </div>
</template>
<script lang="ts">
import { defineComponent, onMounted, onUnmounted, PropType, ref } from "vue";
import { emitter, Msg } from "./const";
import { AdItem } from "./loader";
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
      onClick() {
        if (props.data.store) {
          window.open(props.data.store);
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
  border: 2px solid #ffffff;
  background-color: #ffffff;
  overflow: hidden;
  min-width: 300px;
  max-width: 300px;
  min-height: 50px;
  max-height: 50px;
  cursor: pointer;
  display: flex;
  border: 2px solid #d2d2d2;
  text-align: center;
  align-items: flex-end;
  &:hover {
    border: 2px solid #d1d1d1;
    background-color: #d1d1d1;
  }
  .text {
    user-select: none;
    flex: 1;
    padding-bottom: 2px;
    font-size: 13px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: wrap;
  }
}
</style>
