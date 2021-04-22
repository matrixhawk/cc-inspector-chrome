export class NodeData {
  uuid: string | null = null;
  name: string = '';
  children: Array<NodeData> = []
}

export class DataSupport {
  support: boolean = false;
  msg?: string;
}

export enum ExecuteParaType {
  None,
  UpdateTreeInfo,
  CheckGamePage,
  MemoryInfo,
  SetProperty,
  GetNodeInfo,
}

export class ExecutePara {
  static Type = ExecuteParaType;

  type: ExecuteParaType = ExecuteParaType.None;
  data: any;

  constructor(type: ExecuteParaType, data?: any) {
    this.type = type;
    this.data = data;
  }
}
