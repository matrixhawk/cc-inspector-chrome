// eval 注入脚本的代码,变量尽量使用var,后来发现在import之后,let会自动变为var
const PluginMsg = require("./core/plugin-msg");
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
} from "./devtools/data";

let cc_inspector = {
  inspectorGameMemoryStorage: {},
  postData: {
    scene: {
      name: "",
      children: []
    },
  },
  init() {
    setInterval(function () {
      // this.checkIsGamePage(true);
      // if (this.stop) {
      // } else {
      // }
    }.bind(this), 1000);
    // 注册cc_after_render事件
    window.addEventListener("message", function (event) {
      if (event.data.msg === PluginMsg.Msg.UrlChange) {
        let isCocosGame = this.checkIsGamePage();
      }
    }.bind(this));
  },
  updateTreeInfo() {
    let isCocosCreatorGame = this.checkIsGamePage();
    if (isCocosCreatorGame) {
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
        this.sendMsgToDevTools(PluginMsg.Msg.ListInfo, sendData);
      } else {
        this.sendMsgToDevTools(PluginMsg.Msg.Support, {support: false, msg: "未发现游戏场景,不支持调试游戏!"});
      }
    }
  },
  // 收集节点信息
  getNodeChildren(node, data) {
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
  },
  // 检测是否包含cc变量
  checkIsGamePage() {
    let isCocosGame = typeof cc !== "undefined";
    this.sendMsgToDevTools(PluginMsg.Msg.Support, {support: isCocosGame});
    return isCocosGame;
  },
  pluginSetNodeActive(uuid, isActive) {
    let node = this.inspectorGameMemoryStorage[uuid];
    if (node) {
      if (isActive === 1) {
        node.active = true;
      } else if (isActive === 0) {
        node.active = false;
      }
    }
  },
  _getNodeKeys(node) {
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
  },
  _getPairProperty(key) {
    let pairProperty = {
      rotation: ["rotationX", "rotationY"],
      anchor: ["anchorX", "anchorY"],
      size: ["width", "height"],
      position: ["x", "y", "z"],
      scale: ["scaleX", "scaleY", "scaleZ"],
      designResolution: ["width", "height"], // 这个比较特殊，在key下边，其他的都不是在key下
    };
    for (let value in pairProperty) {
      let pair = pairProperty[value];
      if (pair.includes(key)) {
        return {key: value, values: pair};
      }
    }
    return null;
  },
  _genInfoData(propertyValue, path) {
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
  },
  _getGroupData(node) {
    let nodeGroup = new Group(node.constructor.name);
    let keys = this._getNodeKeys(node);
    for (let i = 0; i < keys.length; i++) {
      let key = keys[i];
      let propertyValue = node[key];
      let pair = this._getPairProperty(key);
      if (pair) {
        // 把这个成对的属性剔除掉
        pair.values.forEach(item => {
          let index = keys.findIndex(el => el === item);
          if (index !== -1) {
            keys.splice(index, 1);
          }
        });
        // 序列化成对的属性
        let info = null;
        let pairValues = pair.values;
        if (pairValues.length === 2) {
          info = new Vec2Data();
        } else if (pairValues.length === 3) {
          info = new Vec3Data();
        }
        pairValues.forEach(el => {
          if (el in node) {
            let propertyPath = [node.uuid, el];
            let vecData = this._genInfoData(node[el], propertyPath);
            if (vecData) {
              info.add(new Property(el, vecData));
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
  },
  // 获取节点信息
  getNodeInfo(uuid) {
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
      this.sendMsgToDevTools(PluginMsg.Msg.NodeInfo, groupData);
    } else {
      // 未获取到节点数据
      console.log("未获取到节点数据");
    }
  },
  logValue(uuid, key) {
    let nodeOrComp = this.inspectorGameMemoryStorage[uuid];
    if (nodeOrComp) {
      console.log(nodeOrComp[key]);
    }
  },
  setValue(uuid, key, value) {
    let nodeOrComp = this.inspectorGameMemoryStorage[uuid];
    if (nodeOrComp && key in nodeOrComp) {
      nodeOrComp[key] = value;
    }
  },
  sendMsgToDevTools(msg, data) {
    // 发送给content.js处理
    window.postMessage({msg: msg, data: data}, "*");
  },

  onMemoryInfo() {
    this.sendMsgToDevTools(PluginMsg.Msg.MemoryInfo, {
      performance: {
        jsHeapSizeLimit: window.performance.memory.jsHeapSizeLimit,
        totalJSHeapSize: window.performance.memory.totalJSHeapSize,
        usedJSHeapSize: window.performance.memory.usedJSHeapSize,
      },
      console: {
        jsHeapSizeLimit: console.memory.jsHeapSizeLimit,
        totalJSHeapSize: console.memory.totalJSHeapSize,
        usedJSHeapSize: console.memory.usedJSHeapSize,
      },
    });
  }
};
window.addEventListener("message", (a, b, c) => {
  console.log(a, b, c);
});
window.ccinspector = window.ccinspector || cc_inspector;
window.ccinspector.init && window.ccinspector.init();// 执行初始化函数




