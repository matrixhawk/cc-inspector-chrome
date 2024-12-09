import { Msg, Page, PluginEvent } from "../../../core/types";
import { NodeInfoData, TreeData } from "../data";
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
        console.log(data);
        const ret: NodeInfoData = {
          uuid: "1",
          group: []
        };
        const event = new PluginEvent(Page.Background, Page.Devtools, Msg.NodeInfo, ret);
        this.send(event);
        break;
      }
      case Msg.TreeInfo: {
        const data: TreeData = {
          id: "1",
          text: "root",
          active: true,
          children: [],
        };
        const event = new PluginEvent(Page.Inject, Page.Devtools, Msg.TreeInfo, data);
        this.send(event);
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