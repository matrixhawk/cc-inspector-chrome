export enum DataType {
  Number,
  String,
  Text,
  Vec2,
  Vec3,
  Enum,
  Bool,
  Color,
}

class Info {
  public type: DataType = DataType.Number;
}

export class TextData extends Info {
  constructor() {
    super();
    this.type = DataType.Text;
  }
}

export class StringData extends Info {
  constructor() {
    super();
    this.type = DataType.String;
  }
}

export class NumberData extends Info {
  constructor() {
    super();
    this.type = DataType.Number;
  }

}

export class Vec2Data extends Info {
  public v1: number = 0;
  public v2: number = 0;

  constructor(v1: number, v2: number) {
    super();
    this.type = DataType.Vec2
    this.v1 = v1;
    this.v2 = v2;
  }
}

export class Vec3Data extends Info {
  public v1: number = 0;
  public v2: number = 0;
  public v3: number = 0;

  constructor(v1: number, v2: number, v3: number) {
    super();
    this.type = DataType.Vec3
    this.v1 = v1;
    this.v2 = v2;
    this.v3 = v3;
  }
}

export class EnumData extends Info {
  constructor() {
    super();
    this.type = DataType.Enum;
  }

}

class NodeInfo {
  public type: string = ''; // 类型


}

class CompInfo {

}

export const testData = [
  {
    name: "group1",
    data: [
      {name: "uuid", value: {type: DataType.String, data: 'abc'}},
      {name: "opacity", value: {type: DataType.Number, data: 100}},

      {
        name: "size",
        value: {
          type: DataType.Vec2,
          data: [
            {name: "X", value: {type: DataType.Number, data: 100}},
            {name: "Y", value: {type: DataType.Number, data: 200}},
          ]
        }
      },
      {
        name: "position",
        value: {
          type: DataType.Vec3,
          data: [
            {name: "X", value: {type: DataType.Number, data: 100}},
            {name: "Y", value: {type: DataType.Number, data: 200}},
            {name: "Z", value: {type: DataType.Number, data: 300}},
          ]
        }
      },
      {
        name: "layout",
        value: {
          type: DataType.Enum,
          data: 1,
          values: [
            {name: "horizontal", value: 1},
            {name: "vertical", value: 2},
          ]
        }
      },
      {
        name: "text",
        value: {
          type: DataType.Text,
          data: 'aaaaaaaaafsf',
        }
      }
    ]
  },
  {
    name: "group2",
    data: [
      {
        name: "bool", value: {
          type: DataType.Bool,
          data: true,
        }
      },
      {
        name: 'color',
        value: {
          type: DataType.Color,
          data: '#ff0000'
        }
      }
    ]
  },
];

