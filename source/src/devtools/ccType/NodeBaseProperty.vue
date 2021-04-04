<template>
  <div id="prop">
    <div v-for="(group, index) in allGroup" :key="index" class="group">
      <div class="header" @click="onClickHeader(group)">
        <i v-if="group.fold" class="el-icon-caret-right"></i>
        <i v-if="!group.fold" class="el-icon-caret-bottom"></i>
        {{ group.name }}
      </div>
      <div class="content" v-show="!group.fold">
        <ui-prop v-for="(item, index) in group.data" :key="index"
                 :name="item.name" :value="item.value">
        </ui-prop>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue"
import {Component, Prop} from "vue-property-decorator"
import UiProp from "./ui-prop.vue"
import {DataType} from "../data";

@Component({
  components: {UiProp},
})
export default class NodeBaseProperty extends Vue {
  name: string = "node-base"

  @Prop()
  allGroup: Array<Record<string, any>> | undefined;

  onClickHeader(group) {
    group.fold = !group.fold;
  }

  @Prop({default: "label"})
  private label?: string | undefined

  @Prop()
  private itemData: any;

  setup() {
  }

  created() {
    this.setTestData()
    this.allGroup.forEach(item => {
      this.$set(item, 'fold', false);
    })
  }

  setTestData() {
    this.allGroup = [
      {
        name: "group1",
        data: [
          {name: "uuid", value: {type: DataType.String, data: 'abc'}},
          {name: "opacity", value: {type: DataType.Number, data: 100}},

          {
            name: "size",
            value: {
              type: DataType.Vec2,
              data: [
                {name: "X", value: {type: DataType.Number, data: 100}},
                {name: "Y", value: {type: DataType.Number, data: 200}},
              ]
            }
          },
          {
            name: "position",
            value: {
              type: DataType.Vec3,
              data: [
                {name: "X", value: {type: DataType.Number, data: 100}},
                {name: "Y", value: {type: DataType.Number, data: 200}},
                {name: "Z", value: {type: DataType.Number, data: 300}},
              ]
            }
          },
          {
            name: "layout",
            value: {
              type: DataType.Enum,
              data: 1,
              values: [
                {name: "horizontal", value: 1},
                {name: "vertical", value: 2},
              ]
            }
          },
          {
            name: "text",
            value: {
              type: DataType.Text,
              data: 'aaaaaaaaafsf',
            }
          }
        ]
      },
      {
        name: "group2",
        data: [
          {
            name: "bool", value: {
              type: DataType.Bool,
              data: true,
            }
          },
          {
            name: 'color',
            value: {
              type: DataType.Color,
              data: '#ff0000'
            }
          }
        ]
      },
    ];

  }

  changeSizeActionWidth(step: number) {
    let w = parseFloat(this.itemData.width);
    // this.itemData.width = w + step;
    this.changeSize();
  }


  changeSizeActionHeight(step: number) {
    let h = parseFloat(this.itemData.height);
    // this.itemData.height = h + step;
    this.changeSize();
  }


  changePositionActionX(step: number) {
    let x = parseFloat(this.itemData.x);
    // this.itemData.x = x + step;
    this.changePosition();
  }


  changePositionActionY(step: number) {
    let y = parseFloat(this.itemData.y);
    // this.itemData.y = y + step;
    this.changePosition();
  }


  changePosition() {
    this._evalCode(
        "window.ccinspector.pluginSetNodePosition(" +
        "'" + this.itemData.uuid + "'," +
        "'" + this.itemData.x + "'," +
        "'" + this.itemData.y + "'" +
        ")");
    this._freshNode();
  }


  changeSize() {
    this._evalCode(
        "window.ccinspector.pluginSetNodeSize(" +
        "'" + this.itemData.uuid + "'," +
        "'" + this.itemData.width + "'," +
        "'" + this.itemData.height + "'" +
        ")");
    this._freshNode();
  }


  changeRotation() {
    console.log("change rotation:" + this.itemData.rotation);
    this._evalCode(
        "window.ccinspector.pluginSetNodeRotation('" +
        this.itemData.uuid + "','" +
        this.itemData.rotation + "')");
    this._freshNode();
  }


  changeColor() {
    let color = this.itemData.color;
    console.log("color:" + color);
    this._evalCode(
        "window.ccinspector.pluginSetNodeColor('" +
        this.itemData.uuid + "','" +
        color + "');");
    this._freshNode();
  }


  onBtnClickNodeHide() {
    let uuid = this.itemData.uuid;
    if (uuid !== undefined) {
      let code = "window.ccinspector.pluginSetNodeActive('" + uuid + "', 0);";
      this._evalCode(code);
      this._freshNode();
    }
  }


  onBtnClickNodeShow() {
    let uuid = this.itemData.uuid;
    if (uuid !== undefined) {
      let code = "window.ccinspector.pluginSetNodeActive('" + uuid + "', 1);";
      this._evalCode(code);
      this._freshNode();
    }
  }


  _freshNode() {
    let uuid = this.itemData.uuid;
    let code2 = "window.ccinspector.getNodeInfo('" + uuid + "')";
    this._evalCode(code2);
  }


  _evalCode(code: string) {
    if (chrome && chrome.devtools) {
      chrome.devtools.inspectedWindow.eval(code);
    } else {
      console.log(code);
    }
  }


}
</script>

<style scoped lang="less">
#prop {
  .group {
    .header {
      height: 40px;
      display: flex;
      flex-direction: row;
      align-items: center;
      user-select: none;
      cursor: pointer;
      border-bottom: 1px #6d6d6d solid;
    }

    .header:hover {
      color: #6d6d6d;
    }

    .content {
      padding: 0 5px;
    }
  }
}
</style>
