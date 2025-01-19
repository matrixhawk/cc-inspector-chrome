import ccui from "@xuyanfeng/cc-ui";
import "@xuyanfeng/cc-ui/dist/ccui.css";
import "@xuyanfeng/cc-ui/iconfont/iconfont.css";
import { createApp } from "vue";
import { DocumentEvent } from "../const";
import App from "../inject-view/app.vue";
export class InjectView {
  private _inited = false;
  private css: string[] = [];
  constructor() {
    document.addEventListener(DocumentEvent.LoadInjectCss, (event: CustomEvent) => {
      const cssArray: string[] = event.detail;
      this.css = cssArray;
    });
  }
  public init() {
    if (this._inited) {
      return;
    }
    this._inited = true;
    this.createUI();
  }
  private createUI() {
    const el = document.createElement("div");
    el.style.position = "absolute";
    el.style.zIndex = "99999";
    el.style.bottom = "0";
    el.style.right = "0";
    el.style.left = "0";
    document.body.appendChild(el);
    const shadowRoot = el.attachShadow({ mode: "open" });
    // load css
    this.css.forEach((css) => {
      const link = document.createElement("link");
      link.href = css;
      link.rel = "stylesheet";
      shadowRoot.appendChild(link);
    });
    // vue
    const root = document.createElement("div");
    shadowRoot.appendChild(root);
    const app = createApp(App);
    // ccui.uiElement.setDoc(document);
    app.use(ccui);
    app.mount(root);
  }
}
export const injectView = new InjectView();
