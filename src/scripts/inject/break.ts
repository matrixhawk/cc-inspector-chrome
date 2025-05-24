export const breakArray: Array<{ node: any; key: string; fn: Function }> = [];

export function addBreak(node: any, key: string, fn: Function) {
  breakArray.push({ node, key, fn });
}
export function cleanBreak() {
  breakArray.forEach((el) => {
    const { node, key, fn } = el;
    if (node && node.isValid) {
      node.off(key, fn);
    }
  });
}
