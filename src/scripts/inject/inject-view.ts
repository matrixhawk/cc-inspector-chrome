import ccui from "@xuyanfeng/cc-ui";
import "@xuyanfeng/cc-ui/dist/ccui.css";
import "@xuyanfeng/cc-ui/iconfont/iconfont.css";
import { createPinia } from "pinia";
import { createApp } from "vue";
import { DocumentEvent } from "../const";
import App from "../inject-view/app.vue";
export class InjectView {
  private _inited = false;
  private css: string[] = [];
  private hasLoadCss = false;
  constructor() {
    document.addEventListener(DocumentEvent.LoadInjectCss, (event: CustomEvent) => {
      const cssArray: string[] = event.detail;
      this.css = cssArray;
      this.loadCss();
    });
  }
  public init() {
    if (this._inited) {
      return;
    }
    this._inited = true;
    this.createUI();
  }
  private loadCss() {
    if (this.hasLoadCss) {
      return;
    }
    if (this.css.length === 0) {
      return;
    }
    this.hasLoadCss = true;
    this.css.forEach((css) => {
      const link = document.createElement("link");
      link.href = css;
      link.rel = "stylesheet";
      document.head.appendChild(link);
    });
  }
  private createUI() {
    const el = document.createElement("div");
    el.setAttribute("app", "");
    el.style.zIndex = "9000";
    document.body.appendChild(el);
    // load css
    this.loadCss();
    // vue
    const app = createApp(App);
    app.use(createPinia());
    // ccui.uiElement.setDoc(document);
    app.use(ccui);
    app.mount(el);
  }
}
export const injectView = new InjectView();
