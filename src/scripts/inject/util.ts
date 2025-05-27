declare const cc: any;

export function isVersion3() {
  if (typeof cc !== "undefined" && cc && typeof cc.ENGINE_VERSION === "string") {
    const version: string = cc.ENGINE_VERSION;
    return version.startsWith("3.");
  }
  return false;
}

export function isHasProperty(base: Object, key: string): boolean {
  let ret = Object.getOwnPropertyDescriptor(base, key);
  if (ret) {
    return true;
  } else {
    let proto = Object.getPrototypeOf(base);
    if (proto) {
      return isHasProperty(proto, key);
    } else {
      return false;
    }
  }
}

export function freshEditor() {
  let router = "";
  let isCreator2X = false;
  if (isVersion3()) {
    isCreator2X = false;
    router = "asset-db/refresh";
  } else {
    isCreator2X = true;
    router = "update-db";
  }
  const url = new URL(window.location.href);
  const port = Number(url.port) || 7456;
  fetch(`http://localhost:${port}/${router}`)
    .then((res) => {
      res.text().then((a: string) => {
        window.location.reload();
        if (isCreator2X === false && a === "success") {
          // 3.x
        }
        if (isCreator2X === true && a === "Changes submitted") {
          // 2.x
        }
      });
    })
    .then((data) => {});
}
