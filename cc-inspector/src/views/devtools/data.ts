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
    this.add(new Property("item3", new NumberData(100)));
    return this;
  }
  testSub() {
    this.add(new Property("item1", new TextData("text")));
    const sub = new ArrayData();
    sub.add(new Property("sub", new StringData("sub")));
    this.add(new Property('arr', sub));
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
  /**
   * 图片的url路径
   */
  data: string = "";

  constructor() {
    super();
    this.type = DataType.Image;
    this.data = "";
    return this;
  }
  test() {
    const cocos = 'data:image/png;base64,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';
    this.data = cocos;
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
