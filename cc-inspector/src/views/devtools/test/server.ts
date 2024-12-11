import { Msg, Page, PluginEvent } from "../../../core/types";
import { ArrayData, BoolData, ColorData, EngineData, EnumData, Group, Info, NodeInfoData, NumberData, ObjectData, ObjectItemRequestData, Property, StringData, TextData, TreeData, Vec2Data, Vec3Data, Vec4Data } from "../data";
export class TestClient {
  recv(event: PluginEvent) {

  }
}
export class TestServer {
  private clients: TestClient[] = [];
  add(client: TestClient) {
    this.clients.push(client);
  }
  recv(msg: string, data: any) {
    switch (msg) {
      case Msg.NodeInfo: {
        const id: string = data as string;

        const group = new Group("test");
        {
          const text = new TextData("text1");
          group.addProperty(new Property("text", text))
        }
        {
          const number = new NumberData(100);
          group.addProperty(new Property("number", number))
        }
        {
          const str = new StringData("str");
          group.addProperty(new Property("str", str))
        }
        {
          const v2 = new Vec2Data();
          v2.add(new Property("x", new NumberData(100)));
          v2.add(new Property("y", new NumberData(200)));
          group.addProperty(new Property("v2", v2))
        }
        {
          const v3 = new Vec3Data();
          v3.add(new Property("x", new NumberData(100)));
          v3.add(new Property("y", new NumberData(200)));
          v3.add(new Property("z", new NumberData(300)));
          group.addProperty(new Property("v3", v3))
        }
        {
          const v4 = new Vec4Data();
          v4.add(new Property("x", new NumberData(100)));
          v4.add(new Property("y", new NumberData(200)));
          v4.add(new Property("z", new NumberData(300)));
          v4.add(new Property("w", new NumberData(400)));
          group.addProperty(new Property("v4", v4))
        }
        {
          const b = new BoolData(true);
          group.addProperty(new Property("bool", b))
        }
        {
          const e = new EnumData();
          e.values.push({ name: "a", value: 1 });
          e.values.push({ name: "b", value: 2 });
          group.addProperty(new Property("enum", e))
        }
        {
          const c = new ColorData('#f00');
          group.addProperty(new Property("color", c))
        }
        {
          const arr = new ArrayData();
          arr.add(new Property("item1", new TextData("text")));
          arr.add(new Property("item2", new BoolData(true)));
          group.addProperty(new Property("arr", arr))
        }
        {
          const obj = new ObjectData();
          obj.data = JSON.stringify({ fack: 'test' });
          group.addProperty(new Property("obj", obj));
        }
        {
          const engine = new EngineData();
          engine.engineName = "engineName";
          engine.engineType = "engineType";
          engine.engineUUID = "engineUUID";
          group.addProperty(new Property("engine", engine))
        }
        {
          const engine = new EngineData();
          engine.engineName = "engineName";
          engine.engineType = "cc_Node";
          engine.engineUUID = "engineUUID";
          group.addProperty(new Property("engine", engine))
        }
        {
          const engine = new EngineData();
          engine.engineName = "engineName";
          engine.engineType = "cc_Srpite";
          engine.engineUUID = "engineUUID";
          group.addProperty(new Property("engine", engine))
        }
        {
          const engine = new EngineData();
          engine.engineName = "engineName";
          engine.engineType = "cc_Label";
          engine.engineUUID = "engineUUID";
          group.addProperty(new Property("engine", engine))
        }
        const ret: NodeInfoData = {
          uuid: id,
          group: [group,]
        };
        const event = new PluginEvent(Page.Background, Page.Devtools, Msg.NodeInfo, ret);
        this.send(event);
        break;
      }
      case Msg.TreeInfo: {
        const ret: TreeData = {
          id: "root",
          text: "root",
          active: true,
          children: [],
        };
        const event = new PluginEvent(Page.Inject, Page.Devtools, Msg.TreeInfo, ret);
        this.send(event);
        break;
      }
      case Msg.SetProperty: {
        console.log(data);
        break;
      }
      case Msg.GetObjectItemData: {
        const d = data as ObjectData;
        const property = [];
        property.push(new Property("fake", new TextData('test')));
        const ret: ObjectItemRequestData = {
          id: d.id,
          data: property,
        }
        const event = new PluginEvent(Page.Inject, Page.Devtools, Msg.GetObjectItemData, ret);
        this.send(event)
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