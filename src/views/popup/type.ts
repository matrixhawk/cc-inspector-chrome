export interface Tools {
  name: string;
  url: string;
  store: string;
}

export class ToolItem {
  constructor(type: string) {
    this.type = type;
  }
  title: string = "";
  type: string = "";
  items: Tools[] = [];
}
