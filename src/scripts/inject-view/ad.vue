<template>
  <div v-show="ads.length" class="ad">
    <div class="body" @mouseenter="onMouseEnter" @mouseleave="onMouseLeave">
      <div class="list ccui-scrollbar">
        <Banner v-for="(item, index) in ads" :data="item" :key="index"></Banner>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import ccui from "@xuyanfeng/cc-ui";
import { defineComponent, onMounted, onUnmounted, ref, toRaw } from "vue";
import { GA_EventName } from "../../ga/type";
import Banner from "./banner.vue";
import { emitter, Msg } from "./const";
import { AdItem, getAdData } from "./loader";
import { sendGaEvent } from "./util";
const { CCButton } = ccui.components;
export default defineComponent({
  name: "ad",
  components: { CCButton, Banner },
  setup(props, { emit }) {
    onMounted(async () => {
      const data = await getAdData();
      if (!data) {
        console.log(`get ad failed`);
        return;
      }
      if (!data.valid) {
        console.log(`set ad forbidden`);
        return;
      }
      if (!data.data.length) {
        console.log(`not find any ad`);
        return;
      }
      ads.value = data.data.filter((item) => item.where === "list");
      console.log("get ads ", toRaw(ads.value));

      sendGaEvent(GA_EventName.ShowAd);
    });
    onUnmounted(() => {});
    function testBanner() {
      const data = new AdItem();
      data.name = "ad test 11111111111 11111111111 44444444444444  5555555555555 111111111111111111 2222222222222222 33333333333333 444444444444444";
      data.store = "http://www.baidu.com";
      emitter.emit(Msg.ChangeAd, data);
    }

    let ads = ref<AdItem[]>([]);

    return {
      ads,
      onMouseEnter() {},
      onMouseLeave() {},
    };
  },
});
</script>
<style lang="less" scoped>
@color-bg: #8d8d8da6;
@color-hover: #f9c04e;
@color-active: #ffaa00;
.ad {
  display: flex;
  flex-direction: column;

  .body {
    display: flex;
    overflow: hidden;
    .list {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      overflow: auto;
    }
  }
}
</style>
