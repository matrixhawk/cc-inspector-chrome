<template>
  <div class="ad" v-show="ads.length && isShow">
    <div class="header">
      <div class="title">Recommend</div>
      <div class="line"></div>
      <div class="close" @click="onClose" :title="closeTitle">
        <i class="icon iconfont icon_close"></i>
      </div>
    </div>
    <div class="body" @mouseenter="onMouseEnter" @mouseleave="onMouseLeave">
      <div class="left slide" @click="onClickBtnLeft">
        <i class="iconfont icon_arrow_left arrow"></i>
      </div>
      <div class="list" ref="elAd" @wheel="onWheel">
        <Banner v-for="(item, index) in ads" :data="item" :key="index"></Banner>
      </div>
      <div class="right slide" @click="onClickBtnRight">
        <i class="iconfont icon_arrow_right arrow"></i>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, onMounted, onUnmounted, ref, toRaw } from "vue";
import { GA_EventName } from "../../ga/type";
import Banner from "./banner.vue";
import { emitter, Msg } from "./const";
import { AdItem, getAdData } from "./loader";
import { ga } from "./util";
export default defineComponent({
  name: "ad",
  components: { Banner },
  setup() {
    let ads = ref<AdItem[]>([]);
    let stopAutoScroll = false;
    const key = "close-time";
    let timer = null;
    const closeTitle = ref("");
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
      ads.value = data.data;
      console.log("get ads ", toRaw(ads.value));
      closeTitle.value = `display again in ${data.showDuration} minute`;

      visibleAd(data.showDuration);
      adScroll(data.scrollDuration);
    });
    function adScroll(scrollDuration: number) {
      timer = setInterval(() => {
        // return;
        if (stopAutoScroll) {
          return;
        }
        if (elAd.value) {
          const el = elAd.value as HTMLElement;

          let left = el.scrollLeft + adWidth;
          if (el.scrollLeft + el.clientWidth >= el.scrollWidth) {
            left = 0;
          }
          el.scrollTo({ left, behavior: "smooth" });
        }
      }, scrollDuration * 1000);
    }
    function visibleAd(showDuration: number) {
      const time = Number(localStorage.getItem(key) || "0");
      if (time) {
        // 单位分钟
        const diff = (Date.now() - time) / 1000 / 60;
        isShow.value = diff >= showDuration;
      }
    }
    onUnmounted(() => {
      clearInterval(timer);
    });
    function testBanner() {
      const data = new AdItem();
      data.name = "ad test 11111111111 11111111111 44444444444444  5555555555555 111111111111111111 2222222222222222 33333333333333 444444444444444";
      data.store = "http://www.baidu.com";
      emitter.emit(Msg.ChangeAd, data);
    }
    const elAd = ref<HTMLElement>(null);
    const adWidth = 300;
    const isShow = ref(true);
    return {
      closeTitle,
      isShow,
      elAd,
      ads,
      onClose() {
        isShow.value = false;
        localStorage.setItem(key, Date.now().toString());
        ga(GA_EventName.CloseAd);
      },
      onMouseEnter() {
        stopAutoScroll = true;
      },
      onMouseLeave() {
        stopAutoScroll = false;
      },
      onWheel(event: WheelEvent) {
        if (!elAd.value) {
          return;
        }
        event.preventDefault();
        const div = elAd.value as HTMLElement;
        if (event.deltaY > 0) {
          div.scrollTo({ left: div.scrollLeft + adWidth, behavior: "smooth" });
        } else {
          div.scrollTo({ left: div.scrollLeft - adWidth, behavior: "smooth" });
        }
      },
      async onClickBtnLeft() {
        if (elAd.value) {
          const el = elAd.value as HTMLElement;
          el.scrollTo({ left: el.scrollLeft - adWidth, behavior: "smooth" });
        }
      },
      async onClickBtnRight() {
        if (elAd.value) {
          const el = elAd.value as HTMLElement;
          el.scrollTo({ left: el.scrollLeft + adWidth, behavior: "smooth" });
        }
      },
    };
  },
});
</script>

<style scoped lang="less">
@color-bg: #8d8d8da6;
@color-hover: #4d4d4da6;
@color-active: #ffaa00;
.ad {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  //overflow: hidden;

  .header {
    display: flex;
    align-items: flex-end;
    .title {
      box-shadow: 0px 0px 2px 0px;
      font-size: 12px;
      user-select: none;
      background-color: white;
      // border-top-left-radius: 5px;
      border-top-right-radius: 5px;
      padding: 3px 9px;
    }
    .line {
      height: 1px;
      flex: 1;
      box-shadow: 0px 0px 2px 0px;
    }
    .close {
      box-shadow: 0px 0px 3px 0px;
      background-color: white;
      border-top-left-radius: 10px;
      cursor: pointer;
      color: rgb(138, 138, 138);
      width: 20px;
      height: 20px;
      display: flex;
      justify-content: center;
      align-items: center;
      .icon {
        font-size: 8px;
        &:hover {
          color: black;
        }
        &:active {
          color: #ffaa00;
        }
      }
    }
  }
  .body {
    display: flex;
    position: relative;
    .list {
      flex: 1;
      display: flex;
      flex-direction: row;
      overflow: hidden;
    }
    .left {
      left: 0;
      background-image: linear-gradient(to left, rgba(0, 0, 0, 0), @color-bg);
      &:hover {
        background-image: linear-gradient(to left, rgba(0, 0, 0, 0), @color-hover);
      }
      &:active {
        background-image: linear-gradient(to left, rgba(0, 0, 0, 0), @color-active);
      }
    }
    .right {
      right: 0px;
      background-image: linear-gradient(to right, rgba(0, 0, 0, 0), @color-bg);
      &:hover {
        background-image: linear-gradient(to right, rgba(0, 0, 0, 0), @color-hover);
      }
      &:active {
        background-image: linear-gradient(to right, rgba(0, 0, 0, 0), @color-active);
      }
    }

    .slide {
      display: flex;
      height: 100%;
      width: 20px;
      cursor: pointer;
      flex-direction: row;
      align-items: center;
      position: absolute;

      .arrow {
        font-size: 22px;
        color: rgb(61, 61, 61);
      }
    }
  }
}
</style>
