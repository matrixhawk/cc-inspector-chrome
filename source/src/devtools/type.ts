export class NodeData {
  uuid: string | null = null;
  name: string = '';
  children: Array<NodeData> = []
}

export class DataSupport {
  support: boolean = false;
  msg?: string;
}



