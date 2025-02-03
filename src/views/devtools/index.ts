import ccui from "@xuyanfeng/cc-ui";
import "@xuyanfeng/cc-ui/dist/ccui.css";
import "@xuyanfeng/cc-ui/iconfont/iconfont.css";
import CCP from "cc-plugin/src/ccp/entry-render";
import { createPinia } from "pinia";
import { createApp } from "vue";
import pluginConfig from "../../../cc-plugin.config";
import "../global.less";
import App from "./index.vue";
export default CCP.init(pluginConfig, {
  ready: function (rootElement: any, args: any) {
    if (args && args.body) {
      ccui.uiElement.setBody(args.body);
    }
    if (args && args.doc) {
      ccui.uiElement.setDoc(args.doc);
    }
    const app = createApp(App);
    app.use(ccui);
    app.use(createPinia());
    app.mount(rootElement);
  },
});
