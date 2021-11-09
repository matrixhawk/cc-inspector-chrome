declare const cc:any;
export  function isVersion3() {
  if (typeof cc.ENGINE_VERSION === "string") {
    const version: string = cc.ENGINE_VERSION;
    return version.startsWith("3.")
  }
  return false;
}
