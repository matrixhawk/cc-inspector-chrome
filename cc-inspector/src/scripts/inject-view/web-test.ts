/**
 * 这个是web测试inject_view的入口，实际chrome插件不应该走这个界面
 */
import ccui from "@xuyanfeng/cc-ui";
import "@xuyanfeng/cc-ui/dist/ccui.css";
import "@xuyanfeng/cc-ui/iconfont/iconfont.css";
import CCP from "cc-plugin/src/ccp/entry-render";
import { createApp } from "vue";
import pluginConfig from "../../../cc-plugin.config";
import App from "./app.vue";

export default CCP.init(pluginConfig, {
  ready: function (rootElement: any, args: any) {
    const app = createApp(App);
    app.use(ccui);
    app.mount(rootElement);
  },
});
