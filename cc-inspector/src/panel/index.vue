<template>
  <div class="panel">
    <vue-particles id="tsparticles" :options="options"></vue-particles>
    <div class="head">
      <img class="icon" src="../../doc/icon128.png" />
      <span class="txt">Cocos Inspector</span>
    </div>
    <div class="content">
      <div class="title">
        <p style="font-size: 40px; font-weight: bold; color: white">为Coocs游戏开发加速。</p>
        <div style="font-size: 18px; font-weight: normal; margin: 30px 0; line-height: 40px; color: white">在Chrome浏览器中查看节点树、节点属性。<br />支持Creator所有版本。</div>
        <CCButton color="rgb(38,187,255)" class="download" @click="onClickBtn">
          <div style="font-size: 20px; font-weight: normal; color: black">下载</div>
        </CCButton>
      </div>
      <video class="video" controls="true" autoplay loop muted src="./res/video.mp4"></video>
    </div>
  </div>
</template>
<script lang="ts">
import ccui from "@xuyanfeng/cc-ui";
import { defineComponent, onMounted, ref } from "vue";
import PluginConfig from "../../cc-plugin.config";
const { CCInput, CCButton } = ccui.components;
export default defineComponent({
  name: "index",
  components: { CCButton },
  setup(props, { emit }) {
    onMounted(() => {
      console.log("hi ~~~");
    });
    const msg = ref(PluginConfig.manifest.name);
    const count = ref(0);
    const options = ref({
      background: {
        color: {
          value: "#000", // 粒子颜色
        },
      },
      fpsLimit: 60,
      interactivity: {
        events: {
          onClick: {
            enable: true,
            mode: "push", // 可用的click模式有: "push", "remove", "repulse", "bubble"。
          },
          onHover: {
            enable: true,
            mode: "grab", // 可用的hover模式有: "grab", "repulse", "bubble"。
          },
          resize: true,
        },
        modes: {
          bubble: {
            distance: 400,
            duration: 2,
            opacity: 0.8,
            size: 40,
          },
          push: {
            quantity: 4,
          },
          repulse: {
            distance: 200,
            duration: 0.4,
          },
        },
      },
      particles: {
        color: {
          value: "#ffffff",
        },
        links: {
          color: "#ffffff", // '#dedede'。线条颜色。
          distance: 150, // 线条长度
          enable: true, // 是否有线条
          opacity: 0.5, // 线条透明度。
          width: 1, // 线条宽度。
        },
        collisions: {
          enable: false,
        },
        move: {
          direction: "none",
          enable: true,
          outMode: "bounce",
          random: false,
          speed: 4, // 粒子运动速度。
          straight: false,
        },
        number: {
          density: {
            enable: true,
            area: 800,
          },
          value: 80, // 粒子数量。
        },
        opacity: {
          value: 0.5, // 粒子透明度。
        },
        shape: {
          type: "circle", // 可用的粒子外观类型有："circle","edge","triangle", "polygon","star"
        },
        size: {
          random: true,
          value: 5,
        },
      },
      detectRetina: true,
    });
    return {
      options,
      msg,
      count,
      onClickBtn() {
        count.value++;
        console.log("click btn");
      },
    };
  },
});
</script>

<style scoped lang="less">
.panel {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  width: 100%;
  height: 100%;
  padding: 30px;
  box-sizing: border-box;
  background-color: black;
  .head {
    z-index: 1;
    display: flex;
    flex-direction: row;
    align-items: flex-end;
    .icon {
      width: 50px;
      height: 50px;
      padding-bottom: 8px;
    }
    .txt {
      color: #188ee1;
      font-size: 40px;
      font-weight: bold;
      margin-left: 10px;
    }
  }
  .content {
    z-index: 1;
    display: flex;
    flex-direction: row;
    .title {
      margin-top: 10px;
      margin-left: 20px;
      min-width: 450px;
      box-sizing: border-box;

      .download {
        width: 160px;
        height: 60px;
        font-size: 20px !important;
      }
    }
    .video {
      object-fit: cover;
      overflow: hidden;
      margin: 5px;
      box-sizing: border-box;
      color: white;
      border: 1px solid rgb(112, 112, 112);
      border-radius: 20px;
      box-shadow: 1px 1px 8px 2px;
    }
  }
}
</style>
