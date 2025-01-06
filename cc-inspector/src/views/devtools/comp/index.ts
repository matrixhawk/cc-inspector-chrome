export enum CompType {
  Node2 = "node-2",
  Spirte2 = "sprite-2",
  Label2 = "label-2",

  Node3 = "node-3",
  Spirte3 = "sprite-3",
  Label3 = "label-3",
}

export function getSimpleProperties(typeName: string): string[] {
  const config = {};
  config[CompType.Node2] = ["position", "rotation", "scale", "anchor", "size", "color", "opacity", "skew", "group"];
  config[CompType.Label2] = ["string", "horizontalAlign", "verticalAlign", "fontSize", "lineHeight", "overflow", "font", "fontFamily", "ebableBold", "enableItalic", "enableUnderline", "underlineHeight", "cacheMode", "useSystemFont"];
  config[CompType.Spirte2] = ["atlas", "spriteFrame", "type", "sizeMode"];
  return config[typeName] || [];
}
export const VisibleProp = {
  Active: "active",
  Enabled: "enabled",
};
