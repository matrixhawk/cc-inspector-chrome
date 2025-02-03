import { loadSlim } from "@tsparticles/slim";
import Particles from "@tsparticles/vue3";
import ccui from "@xuyanfeng/cc-ui";
import "@xuyanfeng/cc-ui/dist/ccui.css";
import "@xuyanfeng/cc-ui/iconfont/iconfont.css";
import CCP from "cc-plugin/src/ccp/entry-render";
import { createApp } from "vue";
import pluginConfig from "../../cc-plugin.config";
import App from "./index.vue";
export default CCP.init(pluginConfig, {
  ready: function (rootElement: any, args: any) {
    const app = createApp(App);
    app.use(ccui);
    //@ts-ignore
    app.use(Particles, {
      init: async (engine) => {
        await loadSlim(engine);
      },
    });
    app.mount(rootElement);
  },
});
