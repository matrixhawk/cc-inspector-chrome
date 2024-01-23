import { createApp } from "vue";
// 用的是ui/index.vue
import App from "./index.vue";
import CCP from "cc-plugin/src/ccp/entry-render";
import pluginConfig from "../../../cc-plugin.config";
import ccui from "@xuyanfeng/cc-ui";
import "@xuyanfeng/cc-ui/dist/ccui.css";
import "@xuyanfeng/cc-ui/iconfont/iconfont.css";
import { init } from './register-panel';
import "../global.less"
export default CCP.init(pluginConfig, {
  ready: function (rootElement: any, args: any) {
    init();
    const app = createApp(App);
    app.use(ccui);
    app.mount(rootElement);
  },
});
