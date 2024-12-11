import { ITreeData } from '@xuyanfeng/cc-ui/types/cc-tree/const';
import { v4 } from "uuid";
export enum DataType {
  Number = 'Number',
  String = 'String',
  Text = 'Text',
  Vec2 = 'Vec2',
  Vec3 = 'Vec3',
  Vec4 = 'Vec4',
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
  public isVec4(): boolean { return false; }
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
  constructor(data: string = "") {
    super();
    this.type = DataType.Text;
    this.data = data;
  }
  public isText(): boolean { return true; }
}

export interface ObjectItemRequestData {
  id: string | null;
  /**
   * 该对象拥有的所有属性
   */
  data: Property[];
}

export interface FrameDetails {
  frameID: number;
  url: string;
}

/**
 * 组件里面定义了引擎类型的数据，比如 `@property(cc.Label)`
 */
export class EngineData extends Info {
  public engineType: string = "";
  public engineUUID: string = "";
  public engineName: string = "";

  constructor() {
    super();
    this.type = DataType.Engine;
  }
  init(name: string, type: string, uuid: string) {
    this.engineName = name;
    this.engineType = type;
    this.engineUUID = uuid;
    return this;
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
  test() {
    this.add(new Property("item1", new TextData("text")));
    this.add(new Property("item2", new BoolData(true)));
    return this;
  }
  public isArray(): boolean { return true; }
  public isArrayOrObject(): boolean { return true; }
}

export class ObjectDataItem extends Info {

}

export class ObjectData extends Info {
  /**
   * object的简单描述快照，类似chrome的console，{a:'fff',b:xxx}
   * 主要是为了防止Object的数据过大，无限递归
   */
  data: string = "";
  constructor() {
    super();
    this.type = DataType.Object;
  }

  test() {
    this.data = JSON.stringify({ fack: 'test' });
    return this;
  }
  testProperty(): Property[] {
    const obj: Object = JSON.parse(this.data);
    const properties: Property[] = [];
    for (let key in obj) {
      if (typeof obj[key] === 'string') {
        properties.push(new Property(key, new StringData(obj[key])));
      } else if (typeof obj[key] === 'number') {
        properties.push(new Property(key, new NumberData(obj[key])));
      } else if (typeof obj[key] === 'boolean') {
        properties.push(new Property(key, new BoolData(obj[key])));
      }
    }
    return properties;
  }
  public isObject(): boolean { return true; }
  public isArrayOrObject(): boolean { return true; }
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
  test() {
    this.add(new Property("x", new NumberData(100)));
    this.add(new Property("y", new NumberData(200)));
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
  test() {
    this.add(new Property("x", new NumberData(100)));
    this.add(new Property("y", new NumberData(200)));
    this.add(new Property("z", new NumberData(300)));
    return this;
  }
  public isVec3(): boolean {
    return true;
  }
}
export class Vec4Data extends Info {
  data: Array<Property> = [];

  constructor() {
    super();
    this.type = DataType.Vec4;
    this.data = [];
    return this;
  }

  add(info: Property) {
    this.data.push(info);
    return this;
  }
  test() {
    this.add(new Property("x", new NumberData(100)));
    this.add(new Property("y", new NumberData(200)));
    this.add(new Property("z", new NumberData(300)));
    this.add(new Property("w", new NumberData(400)));
    return this;
  }
  public isVec4(): boolean {
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
  test() {
    this.values.push({ name: "1", value: 1 });
    this.values.push({ name: "2", value: 2 });
    return this;
  }
}

export class TreeData implements ITreeData {
  id: string = "";
  active: boolean = true;
  text: string = "";
  children: TreeData[] = [];
  constructor(id: string = "", text: string = "") {
    this.id = id;
    this.text = text;
  }
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
  /**
   * 节点的UUID
   */
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
  buildProperty(name: string, info: Info) {
    const property = new Property(name, info);
    this.addProperty(property);
    return this;
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
  /**
   * 节点的uuid
   */
  uuid: string;
  /**
   * 组件数据
   */
  group: Group[];
}
