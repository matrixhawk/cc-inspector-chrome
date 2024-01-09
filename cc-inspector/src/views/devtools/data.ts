import { v4 } from "uuid"

export enum DataType {
  Number = 'Number',
  String = 'String',
  Text = 'Text',
  Vec2 = 'Vec2',
  Vec3 = 'Vec3',
  Enum = 'Enum',
  Bool = 'Bool',
  Color = 'Color',
  Invalid = 'Invalid',
  Array = 'Array', // 暂时在控制台打印下
  Object = 'Object',
  ObjectItem = 'ObjectItem',
  Image = 'Image', // 图片
  Engine = 'Engine',// 引擎的类型：cc.Node, cc.Sprite, cc.Label等。。。
}

export class Info {
  public id: string | null = null;
  public type: DataType = DataType.Number;
  public data: any;
  public readonly: boolean = false;
  public path: Array<string> = [];// 属性对应的路径
  constructor() {
    this.id = v4();
  }
  public isEnum(): boolean { return false; }
  public isVec2(): boolean { return false; }
  public isVec3(): boolean { return false; }
  public isBool(): boolean { return false; }
  public isText(): boolean { return false; }
  public isString(): boolean { return false; }
  public isColor(): boolean { return false; }
  public isInvalid(): boolean { return false; }
  public isNumber(): boolean { return false; }
  public isArrayOrObject(): boolean { return false; }
  public isArray(): boolean { return false; }
  public isObject(): boolean { return false; }
  public isImage(): boolean { return false; }
  public isEngine(): boolean { return false; }
}

export class TextData extends Info {
  constructor() {
    super();
    this.type = DataType.Text;
  }
  public isText(): boolean { return true; }
}

export interface ObjectItemRequestData {
  id: string | null;
  data: Property[];
}

export interface FrameDetails {
  frameID: number;
  url: string;
}

export class EngineData extends Info {
  public engineType: string = "";
  public engineUUID: string = "";
  public engineName: string = "";

  constructor() {
    super();
    this.type = DataType.Engine;
  }
  public isEngine(): boolean { return true; }
}

export class ArrayData extends Info {
  data: Array<Property> = [];

  constructor() {
    super();
    this.type = DataType.Array;
  }

  add(info: Property) {
    this.data.push(info);
    return this;
  }
  public isArray(): boolean { return true; }
}

export class ObjectDataItem extends Info {

}

export class ObjectData extends Info {
  data: string = "";// object的简单描述快照，类似chrome的console，{a:'fff',b:xxx}
  constructor() {
    super();
    this.type = DataType.Object;
  }
  public isObject(): boolean { return true; }
}

export class InvalidData extends Info {
  data: "undefined" | "null" | "Infinity" | "NaN" | string;

  constructor(data: any) {
    super();
    this.data = data;
    this.type = DataType.Invalid;
  }
  public isInvalid(): boolean { return true; }
}

export class ColorData extends Info {
  constructor(color: string) {
    super();
    this.type = DataType.Color;
    this.data = color;
  }
  public isColor(): boolean { return true; }
}

export class StringData extends Info {
  constructor(data: string) {
    super();
    this.type = DataType.String;
    this.data = data;
  }
  public isString(): boolean { return true; }
}

export class NumberData extends Info {
  constructor(data: number) {
    super();
    this.type = DataType.Number;
    this.data = data;
  }
  public isNumber(): boolean { return true; }
}

export class BoolData extends Info {
  constructor(bol: boolean) {
    super();
    this.type = DataType.Bool;
    this.data = bol;
  }
  public isBool(): boolean { return true; }
}

export class Vec2Data extends Info {
  data: Array<Property> = [];

  constructor() {
    super();
    this.type = DataType.Vec2
    this.data = [];
    return this;
  }

  add(info: Property) {
    this.data.push(info);
    return this;
  }
  public isVec2(): boolean {
    return true;
  }
}

export class Vec3Data extends Info {
  data: Array<Property> = [];

  constructor() {
    super();
    this.type = DataType.Vec3;
    this.data = [];
    return this;
  }

  add(info: Property) {
    this.data.push(info);
    return this;
  }
  public isVec3(): boolean {
    return true;
  }
}

export class ImageData extends Info {
  data: string | null = null;

  constructor() {
    super();
    this.type = DataType.Image;
    this.data = null;
    return this;
  }
  public isImage(): boolean { return true; }
}

export class EnumData extends Info {
  public values: Array<{ name: string, value: any }> = [];
  constructor() {
    super();
    this.type = DataType.Enum;
  }
  public isEnum(): boolean {
    return this.type === DataType.Enum;
  }
}

export class TreeData {
  active: boolean = true;
  uuid: string = "";
  name: string = "";
  children: Array<TreeData> = [];
}

export class Property {
  public name: string = "property";
  public value: Info = new Info();

  constructor(name: string, info: Info) {
    this.name = name;
    this.value = info;
  }
}

export class Group {
  public id: string = "";
  public name: string = "group";
  public data: Array<Property> = [];

  constructor(name: string, id?: string) {
    this.name = name;
    this.id = id || '';
  }

  addProperty(property: Property) {
    this.data.push(property)
  }

  sort() {
    let order = ["name", "active", "enabled", "uuid", "position", "rotation", "scale", "anchor", "size", "color", "opacity", "skew", "group"];
    let orderKeys: Array<Property> = [];
    let otherKeys: Array<Property> = [];
    this.data.forEach(property => {
      if (order.find(el => el === property.name)) {
        orderKeys.push(property)
      } else {
        otherKeys.push(property);
      }
    })
    orderKeys.sort((a, b) => {
      return order.indexOf(a.name) - order.indexOf(b.name);
    })
    otherKeys.sort();
    this.data = orderKeys.concat(otherKeys);
  }
}

export interface NodeInfoData {
  uuid: string;// 节点的uuid
  group: Group[];
}
