<template>
  <div class="ad" ref="rootEl" v-show="!picking" @mouseleave="onMouseLeaveRoot">
    <div class="title">
      <div class="btns" v-show="showBtns">
        <div v-for="(item, index) in listArray" :key="index" class="list" @click="item.cb" :title="item.txt">
          <i class="iconfont icon" :class="item.icon"></i>
        </div>
      </div>
      <i class="iconfont icon_cocos cocos" @mousedown="onMouseDown" @mouseenter="onMouseEnterCocosLogo"></i>
    </div>
    <!-- <Memory></Memory> -->
    <CCDialog></CCDialog>
  </div>
</template>
<script lang="ts">
import ccui from "@xuyanfeng/cc-ui";
import { defineComponent, onMounted, ref, toRaw } from "vue";
import { GA_EventName } from "../../ga/type";
import Ad from "./ad.vue";
import Banner from "./banner.vue";
import Memory from "./memory.vue";
import { ga } from "./util";
const { CCDialog } = ccui.components;
interface ListItem {
  icon: string;
  txt: string;
  cb: (event: MouseEvent) => void;
}
export default defineComponent({
  name: "ad",
  components: { CCDialog, Banner, Memory },
  setup() {
    const keyAssistant = "assistant";

    const listArray = ref<ListItem[]>([
      {
        icon: "icon_shop_cart ani_shop_cart",
        txt: "Recommended Plugins",
        cb: () => {
          ccui.dialog.showDialog({
            title: "Recommended Plugins",
            comp: Ad,
            width: 310,
            closeCB: () => {
              ga(GA_EventName.CloseAd);
            },
          });
        },
      },
      {
        icon: "icon_target",
        txt: "Inspect Game",
        cb: () => {
          ga(GA_EventName.DoInspector);
          showBtns.value = false;
          picking.value = true;
          const cursor = document.body.style.cursor;
          document.body.style.cursor = "zoom-in";
          document.addEventListener("mousedown", () => {
            document.body.style.cursor = cursor;
            picking.value = false;
          });
        },
      },
    ]);

    function recoverAssistantTop() {
      const top = Number(localStorage.getItem(keyAssistant) || "0");
      updateAssistantTop(top);
    }

    function updateAssistantTop(top: number) {
      const root = toRaw(rootEl.value) as HTMLDivElement;
      if (!root) {
        return;
      }
      if (top < 0) {
        top = 0;
      }
      const maxTop = document.body.clientHeight - root.clientHeight;
      if (top > maxTop) {
        top = maxTop;
      }
      root.style.top = `${top}px`;
      localStorage.setItem(keyAssistant, top.toString());
    }
    onMounted(async () => {
      recoverAssistantTop();
      window.addEventListener("resize", () => {
        const root = toRaw(rootEl.value) as HTMLDivElement;
        if (!root) {
          return;
        }
        updateAssistantTop(root.offsetTop);
      });
      return;
    });

    const picking = ref(false);
    const rootEl = ref<HTMLDivElement>(null);
    const showBtns = ref(true);
    let autoHideTimer = null;
    let isDraging = false;
    return {
      showBtns,
      listArray,
      rootEl,
      picking,
      onMouseEnterCocosLogo() {
        clearTimeout(autoHideTimer);
        showBtns.value = true;
      },
      onMouseLeaveRoot(event: MouseEvent) {
        if (isDraging) {
          return;
        }
        autoHideTimer = setTimeout(() => {
          showBtns.value = false;
        }, 500);
      },
      onMouseDown(event: MouseEvent) {
        const root = toRaw(rootEl.value) as HTMLDivElement;
        if (!root) {
          return;
        }
        const startY = event.pageY;
        const startTop = root.offsetTop;
        function onMouseMove(e: MouseEvent) {
          isDraging = true;
          const dy = e.pageY - startY;
          const top = startTop + dy;
          updateAssistantTop(top);
        }

        function onMouseUp(e: MouseEvent) {
          isDraging = false;
          document.removeEventListener("mousemove", onMouseMove, true);
          document.removeEventListener("mouseup", onMouseUp, true);
        }
        document.addEventListener("mousemove", onMouseMove, true);
        document.addEventListener("mouseup", onMouseUp, true);
      },
    };
  },
});
</script>

<style scoped lang="less">
@keyframes color-change {
  0% {
    color: #f00;
  }
  50% {
    color: #0f0;
  }
  100% {
    color: #f00;
  }
}
.ad {
  position: fixed;
  z-index: 99999;
  top: 0px;
  right: 0px;
  display: flex;
  flex-direction: column;
  background-color: white;
  border-top-left-radius: 5px;
  border-bottom-left-radius: 5px;
  // overflow: hidden;
  .title {
    display: flex;
    flex-direction: row;
    align-items: center;
    font-size: 14px;
    user-select: none;
    background-color: rgb(0, 0, 0);
    border: 1px solid black;
    color: white;
    padding: 2px 4px;
    border-top-left-radius: 5px;
    border-bottom-left-radius: 5px;

    .btns {
      color: white;
      display: flex;
      flex-direction: row;
      .list {
        display: flex;
        flex-direction: row;
        align-items: center;
        color: white;
        user-select: none;
        &:hover {
          color: rgb(101, 163, 249);
        }
        &:active {
          color: rgb(255, 187, 0);
        }
        .icon {
          font-size: 20px;
        }
        .ani_shop_cart {
          animation: color-change 2s infinite;
        }
      }
    }
    .cocos {
      cursor: move;
      font-size: 20px;
      color: rgb(85, 192, 224);
    }
  }
}
</style>
