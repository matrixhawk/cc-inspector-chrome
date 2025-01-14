<template>
  <div class="game-info">
    <CCSection name="DynamicAtals">
      <template v-slot:header>
        <div style="flex: 1"></div>
        <div v-if="supportView" @click="onClickAtlasView" title="show dynamic atlas in game" class="iconfont view" :class="showDynamicAtals ? 'icon_view_on' : 'icon_view_off'"></div>
      </template>
      <CCProp name="enable" align="left"> <CCCheckBox :disabled="true" :value="dynamicAtalsEnable"></CCCheckBox> </CCProp>
      <CCProp name="texture bleeding" align="left"> <CCCheckBox :disabled="true" :value="dynamicAtalsTextureBleeding"></CCCheckBox> </CCProp>
      <CCProp name="atlas count" align="left"> <CCInputNumber :disabled="true" :value="dynamicAtalsCount"></CCInputNumber> </CCProp>
      <CCProp name="max atlas count" align="left"> <CCInputNumber :disabled="true" :value="dynamicAtalsMaxAtlasCount"></CCInputNumber> </CCProp>
      <CCProp name="max frame size" align="left"> <CCInputNumber :disabled="true" :value="dynamicAtalsMaxFrameSize"></CCInputNumber> </CCProp>
      <CCProp name="atlas texture size" align="left"> <CCInputNumber :disabled="true" :value="dynamicAtalsTextureSize"></CCInputNumber> </CCProp>
    </CCSection>
  </div>
</template>

<script lang="ts">
import ccui from "@xuyanfeng/cc-ui";
import { defineComponent, onMounted, onUnmounted, ref, toRaw } from "vue";
import { Msg, PluginEvent, ResponseGameInfoData } from "../../core/types";
import { bridge } from "./bridge";
const { CCProp, CCCheckBox, CCSection, CCInputNumber } = ccui.components;
export default defineComponent({
  name: "game-info",
  components: { CCProp, CCCheckBox, CCSection, CCInputNumber },
  setup() {
    function onGameInfo(data: PluginEvent) {
      const gameInfo = data.data as ResponseGameInfoData;
      dynamicAtalsEnable.value = !!gameInfo.dynamicAtals.enable;
      dynamicAtalsCount.value = gameInfo.dynamicAtals.atlasCount;
      dynamicAtalsMaxAtlasCount.value = gameInfo.dynamicAtals.maxAtlasCount;
      dynamicAtalsMaxFrameSize.value = gameInfo.dynamicAtals.maxFrameSize;
      dynamicAtalsTextureSize.value = gameInfo.dynamicAtals.textureSize;
      dynamicAtalsTextureBleeding.value = gameInfo.dynamicAtals.textureBleeding;
      supportView.value = !!gameInfo.dynamicAtals.supportView;
    }
    function onDynamicAtlasView(data: PluginEvent) {
      const b = data.data as boolean;
      showDynamicAtals.value = b;
    }
    onMounted(() => {
      bridge.on(Msg.ResponseGameInfo, onGameInfo);
      bridge.on(Msg.ResponseDynamicAtlasView, onDynamicAtlasView);
      bridge.send(Msg.RequestGameInfo);
    });
    onUnmounted(() => {
      bridge.off(Msg.ResponseDynamicAtlasView, onDynamicAtlasView);
      bridge.off(Msg.ResponseGameInfo, onGameInfo);
    });
    const dynamicAtalsEnable = ref(true);
    const dynamicAtalsCount = ref(0);
    const dynamicAtalsMaxAtlasCount = ref(0);
    const dynamicAtalsMaxFrameSize = ref(0);
    const dynamicAtalsTextureSize = ref(0);
    const dynamicAtalsTextureBleeding = ref(true);
    const showDynamicAtals = ref(false);
    const supportView = ref(false);
    function onClickAtlasView() {
      const b = toRaw(showDynamicAtals.value);
      bridge.send(Msg.RequestDynamicAtlasView, !b);
    }
    return {
      supportView,
      showDynamicAtals,
      dynamicAtalsEnable,
      dynamicAtalsCount,
      dynamicAtalsMaxAtlasCount,
      dynamicAtalsMaxFrameSize,
      dynamicAtalsTextureSize,
      dynamicAtalsTextureBleeding,
      onClickAtlasView,
    };
  },
});
</script>

<style scoped lang="less">
.game-info {
  background-color: rgb(32, 32, 32);
  display: flex;
  flex-direction: column;
  .view {
    cursor: pointer;
    margin-right: 5px;
    font-size: 22px;
    &:hover {
      color: white;
    }
    &:active {
      color: rgb(255, 153, 0);
    }
  }
}
</style>
