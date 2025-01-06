export enum CompType {
  Node = "cc.Node",
  Spirte = "cc.Sprite",
  Label = "cc.Label",
  Widget = "cc.Widget",
  Camera = "cc.Camera",
  UITransform = "cc.UITransform",
}

export function getSimpleProperties(typeName: string): string[] {
  const config = {};
  config[CompType.Node] = [
    "position", //
    "rotation",
    "scale",
    "anchor",
    "size",
    "color",
    "opacity",
    "skew",
    "group",
    //----------
    "worldPosition",
    "worldScale",
    // "worldRotation",// 渲染有问题，暂时先不支持这个属性
  ];
  config[CompType.UITransform] = ["anchor", "size"];
  config[CompType.Widget] = [
    "left",
    "right",
    "top",
    "bottom",
    "alignMode", //
    "isAlignLeft",
    "isAlignRight",
    "isAlignTop",
    "isAlignBottom",
  ];
  config[CompType.Label] = [
    "string", //
    "horizontalAlign",
    "verticalAlign",
    "fontSize",
    "lineHeight",
    "overflow",
    "font",
    "fontFamily",
    "ebableBold",
    "enableItalic",
    "enableUnderline",
    "underlineHeight",
    "cacheMode",
    "useSystemFont",
  ];
  config[CompType.Camera] = ["clearColor", "clearFlags", "cullingMask", "depth", "zoomRatio", "alignWithScreen"];
  config[CompType.Spirte] = [
    "atlas",
    "spriteFrame",
    "type",
    "sizeMode", //
    "fillCenter",
    "fillRange",
    "fillRange",
    "fillStart",
    "fillType",
    "grayscale",
    "color",
    "spriteAtlas",
    "trim",
    "type",
  ];
  return config[typeName] || [];
}
export const VisibleProp = {
  Active: "active",
  Enabled: "enabled",
};
