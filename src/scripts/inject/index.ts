import { Inspector } from "./inspector";
const inspector = new Inspector();
inspector.init();
window["CCInspector"] = inspector;

window["DoInspect"] = function () {
  const t = inspector.target;
  if (typeof t === "function") {
    //@ts-ignore
    inspect(t);
  }
  inspector.target = null;
};
