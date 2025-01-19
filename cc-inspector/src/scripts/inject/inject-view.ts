import ccui from "@xuyanfeng/cc-ui";
import "@xuyanfeng/cc-ui/dist/ccui.css";
import "@xuyanfeng/cc-ui/iconfont/iconfont.css";
import { createApp } from "vue";
import { DocumentEvent } from "../const";
import App from "../inject-view/app.vue";
export class InjectView {
  constructor() {
    const el = document.createElement("div");
    el.attachShadow({ mode: "closed" });
    el.style.position = "absolute";
    el.style.zIndex = "99999";
    el.style.bottom = "0";
    el.style.right = "0";
    el.style.left = "0";
    document.body.appendChild(el);
    const app = createApp(App);
    // ccui.uiElement.setDoc(document);
    app.use(ccui);
    app.mount(el);

    document.addEventListener(DocumentEvent.LoadInjectCss, (event: CustomEvent) => {
      const cssArray: string[] = event.detail;
      cssArray.forEach((css) => {
        const link = document.createElement("link");
        link.href = css;
        link.rel = "stylesheet";
        el.appendChild(link);
      });
    });
  }
}
