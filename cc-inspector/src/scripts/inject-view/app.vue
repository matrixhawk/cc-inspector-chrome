<template>
  <div class="ad" ref="rootEl" v-show="!picking" @contextmenu.prevent="onContextMenuRoot" @mouseleave="onMouseLeaveRoot" @mouseenter="onMouseEnterCocosLogo">
    <div class="title">
      <div class="btns" v-show="showBtns">
        <div v-for="(item, index) in listArray" :key="index" class="list" @click="item.click($event, item)" :title="item.txt" v-show="item.visible">
          <i class="iconfont icon" :class="item.icon" @contextmenu.prevent.stop="item.contextmenu"></i>
        </div>
      </div>
      <i class="iconfont icon_cocos cocos" @mousedown="onMouseDown" @click="onCocosLogoClick"></i>
    </div>
    <!-- <Memory></Memory> -->
    <CCDialog></CCDialog>
    <CCMenu></CCMenu>
  </div>
</template>
<script lang="ts">
import ccui from "@xuyanfeng/cc-ui";
import { IUiMenuItem } from "@xuyanfeng/cc-ui/types/cc-menu/const";
import { storeToRefs } from "pinia";
import { defineComponent, onMounted, ref, toRaw } from "vue";
import { GA_EventName } from "../../ga/type";
import { DocumentEvent } from "../const";
import { inspectTarget } from "../inject/inspect-list";
import Ad from "./ad.vue";
import Banner from "./banner.vue";
import Memory from "./memory.vue";
import { appStore } from "./store";
import { ga } from "./util";
declare const cc: any;
const { CCDialog, CCMenu } = ccui.components;
interface ListItem {
  icon: string;
  txt: string;
  visible: boolean;
  /**
   * 点击回调
   */
  click: (event: MouseEvent, item: ListItem) => void;
  contextmenu: (event: MouseEvent) => void;
}
export default defineComponent({
  name: "ad",
  components: { CCDialog, Banner, Memory, CCMenu },
  setup() {
    const store = appStore();
    store.init();
    const { config } = storeToRefs(appStore());
    const listArray = ref<ListItem[]>([
      {
        icon: "icon_shop_cart ani_shop_cart",
        txt: "Recommended Plugins",
        contextmenu: () => {},
        visible: true,
        click: () => {
          ccui.dialog.showDialog({
            title: "Recommended Plugins",
            comp: Ad,
            width: 310,
            height: 500,
            closeCB: () => {
              ga(GA_EventName.CloseAd);
            },
          });
        },
      },
      {
        icon: "icon_do_play",
        click: (event: MouseEvent, item: ListItem) => {
          ga(GA_EventName.GamePlayer);
          if (typeof cc !== "undefined") {
            cc.game.resume();
          }
        },
        visible: true,
        txt: "game play",
        contextmenu: () => {},
      },
      {
        icon: "icon_do_pause",
        visible: true,
        txt: "game pause",
        click: () => {
          ga(GA_EventName.GamePause);
          if (typeof cc !== "undefined") {
            cc.game.pause();
          }
        },
        contextmenu: () => {},
      },
      {
        icon: "icon_do_step",
        visible: true,
        txt: "game step",
        click: () => {
          ga(GA_EventName.GameStep);
          if (typeof cc !== "undefined") {
            cc.game.step();
          }
        },
        contextmenu: () => {},
      },
      {
        icon: "icon_target",
        txt: "Inspect Game",
        visible: true,
        click: () => {
          ga(GA_EventName.GameInspector);
          if (config.value.autoHide) {
            showBtns.value = false;
          }
          picking.value = true;
          if (typeof cc === "undefined") {
            testInspector();
          } else {
            const event = new CustomEvent(DocumentEvent.GameInspectorBegan);
            document.dispatchEvent(event);
          }
        },
        contextmenu: (event: MouseEvent) => {
          const arr = [
            { name: "Inspect Label", type: typeof cc !== "undefined" ? cc.Label : "cc.Label" }, //
            { name: "Inspect Sprite", type: typeof cc !== "undefined" ? cc.Sprite : "cc.Sprite" },
            { name: "Inspect Button", type: typeof cc !== "undefined" ? cc.Button : "cc.Button" },
            { name: "Inspect RichText", type: typeof cc !== "undefined" ? cc.RichText : "cc.RichText" },
          ];
          const compMenu: IUiMenuItem[] = arr.map((item) => {
            return {
              name: item.name,
              enabled: inspectTarget.enabled,
              selected: inspectTarget.isContainInspectType(item.type),
              callback: (menu: IUiMenuItem) => {
                if (menu.selected) {
                  inspectTarget.removeInspectType(item.type);
                } else {
                  inspectTarget.addInspectType(item.type);
                }
              },
            };
          });
          ccui.menu.showMenuByMouseEvent(event, [
            {
              name: "Clear",
              callback: (menu: IUiMenuItem) => {
                const event = new CustomEvent(DocumentEvent.InspectorClear);
                document.dispatchEvent(event);
                ga(GA_EventName.InspectorClear);
              },
            },
            {
              name: "Pick Top",
              selected: config.value.pickTop,
              callback: (menu: IUiMenuItem) => {
                config.value.pickTop = !config.value.pickTop;
                appStore().save();
                ga(GA_EventName.PickTop);
              },
            },
            {
              name: "Filter Enabled",
              selected: inspectTarget.enabled,
              callback: (menu: IUiMenuItem) => {
                ga(GA_EventName.GameInspectorFilter);
                inspectTarget.enabled = !inspectTarget.enabled;
              },
            },
            ...compMenu,
          ]);
        },
      },
    ]);
    document.addEventListener(DocumentEvent.GameInspectorEnd, () => {
      picking.value = false;
    });
    function testInspector() {
      const cursor = document.body.style.cursor;
      document.body.style.cursor = "zoom-in";
      function test(event: MouseEvent) {
        document.removeEventListener("mousedown", test, true);
        document.body.style.cursor = cursor;
        picking.value = false;
      }
      document.addEventListener("mousedown", test, true);
    }
    function recoverAssistantTop() {
      const top = toRaw(config.value.pos);
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
      config.value.pos = top;
      appStore().save();
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
    let autoHide = toRaw(config.value.autoHide);
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
      onCocosLogoClick() {
        showBtns.value = !showBtns.value;
      },
      onContextMenuRoot(event: MouseEvent) {
        const arr: IUiMenuItem[] = [
          {
            name: "auto hide",
            selected: autoHide,
            callback: () => {
              autoHide = !autoHide;
              config.value.autoHide = autoHide;
              appStore().save();
              ga(GA_EventName.MouseMenu, "auto hide");
              if (!autoHide) {
                clearTimeout(autoHideTimer);
                showBtns.value = true;
              }
            },
          },
        ];
        ccui.menu.showMenuByMouseEvent(event, arr);
      },
      onMouseLeaveRoot(event: MouseEvent) {
        if (isDraging) {
          return;
        }
        if (!autoHide) {
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
@x: 1px;
@r: 8deg;
@keyframes color-change {
  0% {
    color: #f00;
    transform: rotate(0) translateX(0px);
  }
  20% {
    transform: rotate(-@r) translateX(-@x);
  }
  40% {
    transform: rotate(@r) translateX(@x);
  }
  50% {
    color: #0f0;
  }
  60% {
    transform: rotate(-@r) translateX(-@x);
  }
  80% {
    transform: rotate(@r) translateX(@x);
  }
  100% {
    color: #f00;
    transform: rotate(0) translateX(0px);
  }
}
.ad {
  position: fixed;
  box-shadow: 0px 0px 6px 1px rgb(255, 255, 255);
  //z-index: 99999;
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
