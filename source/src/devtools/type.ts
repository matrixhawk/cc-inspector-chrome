export class NodeData {
  uuid: string | null = null;
  name: string = '';
  children: Array<NodeData> = []
}

export class DataSupport {
  support: boolean = false;
  msg?: string;
}


export class PluginEvent {
  msg: string = '';
  data: any = null;

  constructor(msg: string, data?: any) {
    this.msg = msg;
    this.data = data || null;
  }
}
