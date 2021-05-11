// eval 注入脚本的代码,变量尽量使用var,后来发现在import之后,let会自动变为var
import {
  ArrayData,
  BoolData,
  ColorData, DataType,
  Group, Info,
  NullOrUndefinedData,
  NumberData, ObjectData,
  Property,
  StringData, TreeData,
  Vec2Data,
  Vec3Data
} from "./data";

import {PluginEvent, Page, Msg} from '@/core/types'

class CCInspector {
  inspectorGameMemoryStorage: Record<string, any> = {}

  init() {
    console.log('cc-inspector init ~~~');
    let timer = setInterval(() => {
      if (this._isCocosGame()) {
        clearInterval(timer)
        // @ts-ignore
        cc.director.on(cc.Director.EVENT_AFTER_SCENE_LAUNCH, () => {
          let isCocosGame = this._isCocosGame();
          this.notifySupportGame(isCocosGame)
        })
      }
    }, 300)

    window.addEventListener("message", (event) => {
      // 接受来自content的事件，有可能也会受到其他插件的
      if (!event || !event.data) {
        return
      }
      let pluginEvent: PluginEvent = event.data;
      if (PluginEvent.check(pluginEvent, Page.Content, Page.Inject)) {
        console.log(`%c[Inject] ${JSON.stringify(pluginEvent)}`, 'color:green;');
        PluginEvent.finish(pluginEvent)
        switch (pluginEvent.msg) {
          case Msg.UrlChange:
          case Msg.Support: {
            let isCocosGame = this._isCocosGame();
            this.notifySupportGame(isCocosGame)
            break;
          }
          case Msg.TreeInfo: {
            this.updateTreeInfo();
            break;
          }
          case Msg.NodeInfo: {
            let nodeUUID = pluginEvent.data;
            this.getNodeInfo(nodeUUID);
            break;
          }
          case Msg.SetProperty: {
            const data: Info = pluginEvent.data;
            // path的设计有优化空间
            const uuid = data.path[0];
            const key = data.path[1];
            const value = data.data;
            if (uuid && key) {
              this.setValue(uuid, key, value);
              this.sendMsgToContent(Msg.UpdateProperty, data);
            }
            break;
          }
        }
      }
    });
  }

  sendMsgToContent(msg: Msg, data: any) {
    // 发送给content.js处理，也会导致发送给了自身，死循环
    window.postMessage(new PluginEvent(Page.Inject, Page.Content, msg, data), "*");
  }

  notifySupportGame(b: boolean) {
    this.sendMsgToContent(Msg.Support, b);
  }

  updateTreeInfo() {
    let isCocosCreatorGame = this._isCocosGame();
    if (isCocosCreatorGame) {
      //@ts-ignore
      let scene = cc.director.getScene();
      if (scene) {
        let treeData = new TreeData();
        this.getNodeChildren(scene, treeData)
        this.sendMsgToContent(Msg.TreeInfo, treeData);
      } else {
        this.sendMsgToContent(Msg.Support, {support: false, msg: "未发现游戏场景,不支持调试游戏!"});
      }
    } else {
      this.notifySupportGame(false)
    }
  }

  // 收集节点信息
  getNodeChildren(node: any, data: TreeData) {
    data.uuid = node.uuid;
    data.name = node.name;
    this.inspectorGameMemoryStorage[node.uuid] = node;
    let nodeChildren = node.getChildren();
    for (let i = 0; i < nodeChildren.length; i++) {
      let childItem = nodeChildren[i];
      let treeData = new TreeData();
      this.getNodeChildren(childItem, treeData);
      data.children.push(treeData)
    }
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
      skew: ['skewX', 'skewY'],
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

  _genInfoData(node: any, key: string, path: any) {
    let propertyValue = node[key];
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
      info.readonly = this._isReadonly(node, key)
      info.path = path;
    } else {
      console.error(`暂不支持的属性值`, propertyValue);

    }
    return info;
  }

  _getGroupData(node: any) {
    let nodeGroup = new Group(node.constructor.name);
    let keys = this._getNodeKeys(node);
    for (let i = 0; i < keys.length;) {
      let key = keys[i];
      let propertyValue = node[key];
      let pair = this._getPairProperty(key);
      if (pair) {
        let bSplice = false;
        // 把这个成对的属性剔除掉
        pair.values.forEach((item: string) => {
          let index = keys.findIndex(el => el === item);
          if (index !== -1) {
            keys.splice(index, 1);
            bSplice = true;
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
            let vecData = this._genInfoData(node, el, propertyPath);
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
        if (!bSplice) {
          i++;
        }
      } else {
        let propertyPath = [node.uuid, key];
        let info = this._genInfoData(node, key, propertyPath);
        if (info) {
          nodeGroup.addProperty(new Property(key, info));
        }
        i++;
      }
    }
    nodeGroup.sort();
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
      this.sendMsgToContent(Msg.NodeInfo, groupData);
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

  _isReadonly(base: Object, key: string): boolean {
    let obj = Object.getPrototypeOf(base);
    if (obj) {
      let ret = Object.getOwnPropertyDescriptor(obj, key)
      if (ret && ret.set) {
        return false;
      } else {
        return this._isReadonly(obj, key)
      }
    } else {
      return true;
    }
  }

  setValue(uuid: string, key: string, value: string) {
    let nodeOrComp = this.inspectorGameMemoryStorage[uuid];
    if (nodeOrComp && key in nodeOrComp) {
      if (this._isReadonly(nodeOrComp, key)) {
        console.warn(`值不允许修改`);
      } else {
        nodeOrComp[key] = value;
      }
    }
  }


  onMemoryInfo() {
    this.sendMsgToContent(Msg.MemoryInfo, {
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




