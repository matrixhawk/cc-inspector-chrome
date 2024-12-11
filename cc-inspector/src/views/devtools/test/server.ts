import { v4 } from "uuid";
import { Msg, Page, PluginEvent } from "../../../core/types";
import { ArrayData, BoolData, ColorData, EngineData, EnumData, Group, Info, NodeInfoData, NumberData, ObjectData, ObjectItemRequestData, Property, StringData, TextData, TreeData, Vec2Data, Vec3Data, Vec4Data } from "../data";
export class TestClient {
  recv(event: PluginEvent) {

  }
}
class Node {
  active: boolean = true;
  children: Node[] = [];
  id: string = "";
  name: string = "";
  components: Group[] = [];
  constructor(name: string = "") {
    this.name = name;
    this.active = true;
    this.id = v4();
    this.children = [];
  }
  buildComponent(name: string) {
    const info = new Group(name)
    this.components.push(info);
    return info;
  }

  buildChild(name: string) {
    const node = new Node(name);
    this.children.push(node);
    return node;
  }
  toTreeData(data: TreeData) {
    data.id = this.id;
    data.text = this.name;
    data.active = this.active;
    for (let i = 0; i < this.children.length; i++) {
      const child = this.children[i];
      const childData = new TreeData();
      child.toTreeData(childData);
      data.children.push(childData);
    }
  }
  private allNodes(): Node[] {
    const nodes: Node[] = [];
    function circle(node: Node) {
      node.children.forEach(child => {
        nodes.push(child);
        circle(child);
      })
    }
    circle(this);
    return nodes;
  }
  findNode(id: string): Node | null {
    const nodes: Node[] = this.allNodes();
    return nodes.find(node => node.id === id) || null;
  }
  findInfo(id: string): Info | null {
    const nodes: Node[] = this.allNodes();
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      const comp = node.findProperty(id);
      if (comp) {
        return comp;
      }
    }
    return null;
  }
  private findProperty(id: string): Info | null {
    for (let i = 0; i < this.components.length; i++) {
      const comp = this.components[i];
      for (let j = 0; j < comp.data.length; j++) {
        const item: Property = comp.data[j];
        if (item.value.id === id) {
          return item.value;
        }
      }
    }
    return null;
  }
}
export class TestServer {
  private clients: TestClient[] = [];
  private testData: Node = new Node("scene");
  constructor() {
    this.testData.buildChild("base").buildComponent("group1")
      .buildProperty('bool', new BoolData(true))
      .buildProperty("text", new TextData("text"))
      .buildProperty("number", new NumberData(100))
      .buildProperty("string", new StringData("string"))
      .buildProperty("enum", new EnumData().test())
      .buildProperty("color", new ColorData('#f00'))
      .buildProperty("array", new ArrayData().test())
      .buildProperty("object", new ObjectData().test())
      ;
    this.testData.buildChild('vec').buildComponent('group2')
      .buildProperty("number", new NumberData(200))
      .buildProperty("vec2", new Vec2Data().test())
      .buildProperty("vec3", new Vec3Data().test())
      .buildProperty("vec4", new Vec4Data().test())

    this.testData.buildChild("engine").buildComponent("group3")
      .buildProperty("node", new EngineData().init('name', 'cc_Node', 'uuid'))
      .buildProperty("sprite", new EngineData().init('name', 'cc_Sprite', 'uuid'))
      .buildProperty("label", new EngineData().init('name', 'cc_Label', 'uuid'))
      .buildProperty("un_known", new EngineData().init('name', 'un_known', 'uuid'))
  }
  add(client: TestClient) {
    this.clients.push(client);
  }
  recv(msg: string, data: any) {
    switch (msg) {
      case Msg.NodeInfo: {
        const id: string = data as string;
        const node: Node = this.testData.findNode(id);
        let group = [];
        if (node) {
          group = node.components;
        } else {
          let g = new Group("scene").buildProperty("scene id", new StringData(id));
          group.push(g);
        }
        const ret: NodeInfoData = {
          uuid: id,
          group: group
        };
        const event = new PluginEvent(Page.Background, Page.Devtools, Msg.NodeInfo, ret);
        this.send(event);
        break;
      }
      case Msg.TreeInfo: {
        const ret: TreeData = new TreeData();
        this.testData.toTreeData(ret);
        const event = new PluginEvent(Page.Inject, Page.Devtools, Msg.TreeInfo, ret);
        this.send(event);
        break;
      }
      case Msg.SetProperty: {
        console.log(data);
        break;
      }
      case Msg.GetObjectItemData: {
        const objData = data as ObjectData;
        const info = this.testData.findInfo(objData.id);
        if (info && info instanceof ObjectData) {
          const ret: ObjectItemRequestData = {
            id: objData.id,
            data: info.testProperty(),
          }
          const event = new PluginEvent(Page.Inject, Page.Devtools, Msg.GetObjectItemData, ret);
          this.send(event)
        }
        break;
      }
      case Msg.LogData: {
        console.log(data);
        break;
      }
      default:
        break;
    }
  }
  send(event: PluginEvent) {
    this.clients.forEach((client) => {
      client.recv(event)
    });
  }
}
export const testServer = new TestServer();