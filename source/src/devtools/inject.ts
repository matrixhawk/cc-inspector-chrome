// eval 注入脚本的代码,变量尽量使用var,后来发现在import之后,let会自动变为var
import * as PluginMsg from '../core/plugin-msg'
import {
  ArrayData,
  BoolData,
  ColorData,
  Group,
  NullOrUndefinedData,
  NumberData, ObjectData,
  Property,
  StringData,
  Vec2Data,
  Vec3Data
} from "./data";

import {PluginEvent} from './type'

class CCInspector {
  inspectorGameMemoryStorage: Record<string, any> = {}

  init() {
    console.log('cc-inspector init ~~~');
    setInterval(() => {
      // this.checkIsGamePage(true);
      // if (this.stop) {
      // } else {
      // }
    }, 1000);
    // 注册cc_after_render事件
    window.addEventListener("message", (event: any) => {
      // 接受来自background的事件，有可能也会受到其他插件的
      if (!event || !event.data) {
        return
      }
      let pluginEvent: PluginEvent = event.data;
      switch (pluginEvent.msg) {
        case PluginMsg.Msg.UrlChange:
        case PluginMsg.Msg.Support: {
          let isCocosGame = this._isCocosGame();
          this.sendMsgToContent(PluginMsg.Msg.Support, {support: isCocosGame});
          break;
        }
        case PluginMsg.Msg.TreeInfo: {

          debugger
          break;
        }
        case PluginMsg.Msg.NodeInfo: {
          debugger
          break;
        }
        case PluginMsg.Msg.SetProperty: {
          debugger;
          break;
        }
      }
    });
  }

  devPageCallEntry(str: string) {
    let para: PluginEvent = JSON.parse(str);
    debugger
    if (this._isCocosGame()) {
      switch (para.msg) {
        case PluginMsg.Msg.TreeInfo:
          this.updateTreeInfo();
          break;
        case PluginMsg.Msg.Support:

          break;
        case PluginMsg.Msg.MemoryInfo:
          break;
        case PluginMsg.Msg.SetProperty:
          break;
        case PluginMsg.Msg.NodeInfo:
          this.getNodeInfo(para.data as string);
          break;
      }
    } else {
      this.sendMsgToContent(PluginMsg.Msg.Support, {support: false});
    }
  }

  updateTreeInfo() {
    let isCocosCreatorGame = this._isCocosGame();
    if (isCocosCreatorGame) {
      //@ts-ignore
      let scene = cc.director.getScene();
      if (scene) {
        let sendData = {
          uuid: scene.uuid,
          name: scene.name,
          children: [],
        };
        this.inspectorGameMemoryStorage[scene.uuid] = scene;
        let sceneChildren = scene.getChildren();
        for (let i = 0; i < sceneChildren.length; i++) {
          let node = sceneChildren[i];
          this.getNodeChildren(node, sendData.children);
        }
        this.sendMsgToContent(PluginMsg.Msg.TreeInfo, sendData);
      } else {
        this.sendMsgToContent(PluginMsg.Msg.Support, {support: false, msg: "未发现游戏场景,不支持调试游戏!"});
      }
    }
  }

  // 收集节点信息
  getNodeChildren(node: any, data: Array<any>) {
    let nodeData = {
      uuid: node.uuid,
      name: node.name,
      children: [],
    };
    this.inspectorGameMemoryStorage[node.uuid] = node;
    let nodeChildren = node.getChildren();
    for (let i = 0; i < nodeChildren.length; i++) {
      let childItem = nodeChildren[i];
      this.getNodeChildren(childItem, nodeData.children);
    }
    data.push(nodeData);
  }

  _isCocosGame() {
    // @ts-ignore 检测是否包含cc变量
    return typeof cc !== "undefined";
  }

  pluginSetNodeActive(uuid: string, isActive: number) {
    let node = this.inspectorGameMemoryStorage[uuid];
    if (node) {
      if (isActive === 1) {
        node.active = true;
      } else if (isActive === 0) {
        node.active = false;
      }
    }
  }

  _getNodeKeys(node: any) {
    let keys = [];
    let excludeProperty = [
      "children", "quat", "node",
      // 生命周期函数
      "onFocusInEditor", "onRestore", "start", "lateUpdate", "update", "resetInEditor", "onLostFocusInEditor",
      "onEnable", "onDisable", "onDestroy", "onLoad",
    ];
    for (let key in node) {
      if (!key.startsWith("_") &&
        !excludeProperty.includes(key) &&
        typeof node[key] !== "function") {
        keys.push(key);
      }
    }
    return keys;
  }

  _getPairProperty(key: string) {
    let pairProperty: Record<string, any> = {
      rotation: ["rotationX", "rotationY"],
      anchor: ["anchorX", "anchorY"],
      size: ["width", "height"],
      position: ["x", "y", "z"],
      scale: ["scaleX", "scaleY", "scaleZ"],
      designResolution: ["width", "height"], // 这个比较特殊，在key下边，其他的都不是在key下
    };
    for (let value in pairProperty) {
      if (pairProperty.hasOwnProperty(value)) {
        let pair = pairProperty[value];
        if (pair.includes(key)) {
          return {key: value, values: pair};
        }
      }
    }
    return null;
  }

  _genInfoData(propertyValue: any, path: any) {
    let info = null;
    switch (typeof propertyValue) {
      case "boolean":
        info = new BoolData(propertyValue);
        break;
      case "number":
        info = new NumberData(propertyValue);
        break;
      case "string":
        info = new StringData(propertyValue);
        break;
      default:
        if (propertyValue == null || typeof propertyValue === "undefined") {
          info = new NullOrUndefinedData();
          //@ts-ignore
        } else if (propertyValue instanceof cc.Color) {
          let hex = propertyValue.toHEX();
          info = new ColorData(`#${hex}`);
        } else if (Array.isArray(propertyValue)) {
          info = new ArrayData();
        } else if (propertyValue instanceof Object) {
          info = new ObjectData();
        } else {
        }
        break;
    }
    if (info) {
      info.path = path;
    } else {
      console.error(`暂不支持的属性值`, propertyValue);

    }
    return info;
  }

  _getGroupData(node: any) {
    let nodeGroup = new Group(node.constructor.name);
    let keys = this._getNodeKeys(node);
    for (let i = 0; i < keys.length; i++) {
      let key = keys[i];
      let propertyValue = node[key];
      let pair = this._getPairProperty(key);
      if (pair) {
        // 把这个成对的属性剔除掉
        pair.values.forEach((item: string) => {
          let index = keys.findIndex(el => el === item);
          if (index !== -1) {
            keys.splice(index, 1);
          }
        });
        // 序列化成对的属性
        let info: Vec2Data | Vec3Data | null = null;
        let pairValues = pair.values;
        if (pairValues.length === 2) {
          info = new Vec2Data();
        } else if (pairValues.length === 3) {
          info = new Vec3Data();
        }
        pairValues.forEach((el: string) => {
          if (el in node) {
            let propertyPath = [node.uuid, el];
            let vecData = this._genInfoData(node[el], propertyPath);
            if (vecData) {
              info && info.add(new Property(el, vecData));
            }
          } else {
            console.warn(`属性异常，节点丢失属性: ${el}，请检查 pairProperty的设置`);
          }
        });
        if (info) {
          let property = new Property(pair.key, info);
          nodeGroup.addProperty(property);
        }
      } else {
        let propertyPath = [node.uuid, key];
        let info = this._genInfoData(propertyValue, propertyPath);
        if (info) {
          nodeGroup.addProperty(new Property(key, info));
        }
      }
    }
    return nodeGroup;
  }

  // 获取节点信息
  getNodeInfo(uuid: string) {
    let node = this.inspectorGameMemoryStorage[uuid];
    if (node) {
      let groupData = [];
      // 收集节点信息
      let nodeGroup = this._getGroupData(node);
      groupData.push(nodeGroup);
      // 收集组件信息
      let nodeComp = node._components;
      for (let i = 0; i < nodeComp.length; i++) {
        let itemComp = nodeComp[i];
        this.inspectorGameMemoryStorage[itemComp.uuid] = itemComp;
        let compGroup = this._getGroupData(itemComp);
        groupData.push(compGroup);
      }
      this.sendMsgToContent(PluginMsg.Msg.NodeInfo, groupData);
    } else {
      // 未获取到节点数据
      console.log("未获取到节点数据");
    }
  }

  logValue(uuid: string, key: string) {
    let nodeOrComp = this.inspectorGameMemoryStorage[uuid];
    if (nodeOrComp) {
      console.log(nodeOrComp[key]);
    }
  }

  setValue(uuid: string, key: string, value: string) {
    let nodeOrComp = this.inspectorGameMemoryStorage[uuid];
    if (nodeOrComp && key in nodeOrComp) {
      nodeOrComp[key] = value;
    }
  }

  sendMsgToContent(msg: string, data: any) {
    // 发送给content.js处理
    window.postMessage(new PluginEvent(msg, data), "*");
  }

  onMemoryInfo() {
    this.sendMsgToContent(PluginMsg.Msg.MemoryInfo, {
      performance: {
        // @ts-ignore
        jsHeapSizeLimit: window.performance.memory.jsHeapSizeLimit,
        // @ts-ignore
        totalJSHeapSize: window.performance.memory.totalJSHeapSize,
        // @ts-ignore
        usedJSHeapSize: window.performance.memory.usedJSHeapSize,
      },
      console: {
        jsHeapSizeLimit: console.memory.jsHeapSizeLimit,
        totalJSHeapSize: console.memory.totalJSHeapSize,
        usedJSHeapSize: console.memory.usedJSHeapSize,
      },
    });
  }
}

let inspector = new CCInspector();
inspector.init();
//@ts-ignore
window.CCInspector = inspector;




