// eval 注入脚本的代码,变量尽量使用var,后来发现在import之后,let会自动变为var
const PluginMsg = require("./core/plugin-msg");
import {BoolData, ColorData, Group, NumberData, Property, StringData, Vec2Data, Vec3Data} from "./devtools/data";

let cc_inspector = {
  inspectorGameMemoryStorage: {},
  msgType: {
    nodeInfo: 2,//节点信息
    nodeListInfo: 1,// 节点列表信息
    notSupport: 0,// 不支持的游戏
  },
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
        // console.log(postData);
        this.sendMsgToDevTools(PluginMsg.Msg.ListInfo, sendData);
      } else {
        this.sendMsgToDevTools(PluginMsg.Msg.Support, {support: false, msg: "未发现游戏场景,不支持调试游戏!"});
      }
    }
  },
  // 检测是否包含cc变量
  checkIsGamePage() {
    let isCocosGame = typeof cc !== "undefined";
    this.sendMsgToDevTools(PluginMsg.Msg.Support, {support: isCocosGame});
    return isCocosGame;
  },

  testMsg2() {
    chrome.runtime.connect({name: "inject"});
  },
  // 收集组件信息
  getNodeComponentsInfo(node) {
    let ret = [];
    let nodeComp = node._components;
    for (let i = 0; i < nodeComp.length; i++) {
      let itemComp = nodeComp[i];
      this.inspectorGameMemoryStorage[itemComp.uuid] = itemComp;
      ret.push({
        uuid: itemComp.uuid,
        type: itemComp.constructor.name,
        name: itemComp.name,
      });
    }
    return ret;
  },

  pluginSetNodeColor(uuid, colorHex) {
    let node = this.inspectorGameMemoryStorage[uuid];
    if (node) {
      node.color = cc.hexToColor(colorHex);
    }
  },
  pluginSetNodeRotation(uuid, rotation) {
    let node = this.inspectorGameMemoryStorage[uuid];
    if (node) {
      node.rotation = rotation;
    }
  },
  pluginSetNodePosition(uuid, x, y) {
    let node = this.inspectorGameMemoryStorage[uuid];
    if (node) {
      node.x = x;
      node.y = y;
    }
  },
  pluginSetNodeSize(uuid, width, height) {
    let node = this.inspectorGameMemoryStorage[uuid];
    if (node) {
      node.width = width;
      node.height = height;
    }
  },
  // 设置节点是否可视
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
    let excludeProperty = ["children", "quat"];
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

    };
    for (let value in pairProperty) {
      let pair = pairProperty[value];
      if (pair.includes(key)) {
        return {key: value, values: pair};
      }
    }
    return null;
  },
  _genInfoData(propertyValue) {
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
        if (Array.isArray(propertyValue)) {

        } else if (propertyValue instanceof cc.Color) {
          let hex = propertyValue.toHEX();
          info = new ColorData(`#${hex}`);
        } else {
        }
        break;
    }
    if (!info) {
      console.error(`暂不支持的属性值`, propertyValue);
    }
    return info;
  },
  // 获取节点信息
  getNodeInfo(uuid) {
    debugger
    let node = this.inspectorGameMemoryStorage[uuid];
    if (node) {
      let nodeGroup = new Group("Node");
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
              let vecData = this._genInfoData(node[el]);
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
          let info = this._genInfoData(propertyValue);
          if (info) {
            nodeGroup.addProperty(new Property(key, info));
          }
        }
      }


      let nodeComp = this.getNodeComponentsInfo(node);
      let nodeData = {
        type: node.constructor.name,
        components: nodeComp
      };
      this.sendMsgToDevTools(PluginMsg.Msg.NodeInfo, nodeGroup);
    } else {
      // 未获取到节点数据
      console.log("未获取到节点数据");
    }
  },

  // 收集节点信息
  getNodeChildren(node, data) {
    // console.log("nodeName: " + node.name);
    let nodeData = {
      uuid: node.uuid,
      name: node.name,
      children: [],
    };
    this.inspectorGameMemoryStorage[node.uuid] = node;
    let nodeChildren = node.getChildren();
    for (let i = 0; i < nodeChildren.length; i++) {
      let childItem = nodeChildren[i];
      // console.log("childName: " + childItem.name);
      this.getNodeChildren(childItem, nodeData.children);
    }
    data.push(nodeData);
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
window.ccinspector = window.ccinspector || cc_inspector;
window.ccinspector.init && window.ccinspector.init();// 执行初始化函数




