<template>
  <div id="app">
    <!--    <div>-->
    <!--      <ui-prop name="uuid">-->
    <!--        <span> {{ itemData.uuid }}</span>-->
    <!--      </ui-prop>-->
    <!--      <ui-prop name="name">-->
    <!--        <span> {{ itemData.name }}</span>-->
    <!--      </ui-prop>-->
    <!--      &lt;!&ndash;坐标&ndash;&gt;-->
    <!--      <ui-prop name="Position">-->
    <!--        <div style="float: left;width: 100%;">-->
    <!--          <ui-prop name="X" style="width: 50%;float: left; cursor: ew-resize;"-->
    <!--                   @movestep="changePositionActionX"-->
    <!--                   step="10">-->
    <!--            &lt;!&ndash;<span>{{itemData.x}}</span>&ndash;&gt;-->
    <!--            <input class="myInput"-->
    <!--                   @change="changePosition"-->
    <!--                   placeholder="itemData.x"-->
    <!--                   v-model="itemData.x">-->
    <!--          </ui-prop>-->
    <!--          <ui-prop name="Y" style="width: 50%;float:left;cursor: ew-resize;"-->
    <!--                   @movestep="changePositionActionY"-->
    <!--                   step="10">-->
    <!--            &lt;!&ndash;<span>{{itemData.y}}</span>&ndash;&gt;-->
    <!--            <input class="myInput"-->
    <!--                   @change="changePosition"-->
    <!--                   placeholder="itemData.y"-->
    <!--                   v-model="itemData.y">-->
    <!--          </ui-prop>-->
    <!--        </div>-->
    <!--      </ui-prop>-->
    <!--      &lt;!&ndash;旋转&ndash;&gt;-->
    <!--      &lt;!&ndash;rotationX, rotationY暂时舍弃显示&ndash;&gt;-->
    <!--      <ui-prop name="Rotation">-->
    <!--        <span> {{ itemData.rotation }}</span>-->
    <!--        &lt;!&ndash;<input class="myInput"&ndash;&gt;-->
    <!--        &lt;!&ndash;@change="changeRotation"&ndash;&gt;-->
    <!--        &lt;!&ndash;placeholder="itemData.rotation"&ndash;&gt;-->
    <!--        &lt;!&ndash;v-model="itemData.rotation"&ndash;&gt;-->
    <!--        &lt;!&ndash;style="width: 98%">&ndash;&gt;-->
    <!--      </ui-prop>-->
    <!--      &lt;!&ndash;缩放&ndash;&gt;-->
    <!--      <ui-prop name="Scale">-->
    <!--        <div style="float: left;width: 100%;">-->
    <!--          <ui-prop name="X" style="width: 50%;float: left;">-->
    <!--            <span>{{ itemData.scaleX }}</span>-->
    <!--          </ui-prop>-->
    <!--          <ui-prop name="Y" style="width: 50%;float:left;">-->
    <!--            <span>{{ itemData.scaleY }}</span>-->
    <!--          </ui-prop>-->
    <!--        </div>-->
    <!--      </ui-prop>-->
    <!--      &lt;!&ndash;锚点&ndash;&gt;-->
    <!--      <ui-prop name="Anchor">-->
    <!--        <div style="float: left;width: 100%;">-->
    <!--          <ui-prop name="X" style="width: 50%;float: left;">-->
    <!--            <span>{{ itemData.anchorX }}</span>-->
    <!--          </ui-prop>-->
    <!--          <ui-prop name="Y" style="width: 50%;float:left;">-->
    <!--            <span>{{ itemData.anchorY }}</span>-->
    <!--          </ui-prop>-->
    <!--        </div>-->
    <!--      </ui-prop>-->
    <!--      &lt;!&ndash;尺寸&ndash;&gt;-->
    <!--      <ui-prop name="Size">-->
    <!--        <div style="float: left;width: 100%;">-->
    <!--          <ui-prop name="W" style="width: 50%;float: left;cursor: ew-resize;"-->
    <!--                   @movestep="changeSizeActionWidth"-->
    <!--                   step="10">-->
    <!--            &lt;!&ndash;<span>{{itemData.width}}</span>&ndash;&gt;-->
    <!--            <input class="myInput"-->
    <!--                   @change="changeSize"-->
    <!--                   placeholder="itemData.width"-->
    <!--                   v-model="itemData.width">-->
    <!--          </ui-prop>-->
    <!--          <ui-prop name="H" style="width: 50%;float:left;cursor: ew-resize;"-->
    <!--                   @movestep="changeSizeActionHeight"-->
    <!--                   step="10">-->
    <!--            &lt;!&ndash;<span>{{itemData.height}}</span>&ndash;&gt;-->
    <!--            <input class="myInput"-->
    <!--                   @change="changeSize"-->
    <!--                   placeholder="itemData.height"-->
    <!--                   v-model="itemData.height">-->
    <!--          </ui-prop>-->
    <!--        </div>-->
    <!--      </ui-prop>-->
    <!--      &lt;!&ndash;透明度&ndash;&gt;-->
    <!--      <ui-prop name="Opacity">-->
    <!--        <span>{{ itemData.opacity }}</span>-->
    <!--      </ui-prop>-->
    <!--      &lt;!&ndash;斜切&ndash;&gt;-->
    <!--      <ui-prop name="Skew">-->
    <!--        <div style="float: left;width: 100%;">-->
    <!--          <ui-prop name="X" style="width: 50%;float: left;">-->
    <!--            <span>{{ itemData.skewX }}</span>-->
    <!--          </ui-prop>-->
    <!--          <ui-prop name="Y" style="width: 50%;float:left;">-->
    <!--            <span>{{ itemData.skewY }}</span>-->
    <!--          </ui-prop>-->
    <!--        </div>-->
    <!--      </ui-prop>-->
    <!--    </div>-->
    <!--    <ui-prop name="zIndex">-->
    <!--      <span>{{ itemData.zIndex }}</span>-->
    <!--    </ui-prop>-->
    <!--    <ui-prop name="childrenCount">-->
    <!--      <span>{{ itemData.childrenCount }}</span>-->
    <!--    </ui-prop>-->
    <!--    &lt;!&ndash;节点状态&ndash;&gt;-->
    <!--    <ui-prop name="active">-->
    <!--      <p v-if="itemData.active" style="margin: 0;display: flex;align-items: center;flex-wrap: wrap;">-->
    <!--        <input type="checkbox"-->
    <!--               style="width: 20px;height: 20px;"-->
    <!--               :checked.sync="itemData.active"-->
    <!--               @click="onBtnClickNodeHide">-->
    <!--        隐藏节点-->
    <!--      </p>-->

    <!--      <p v-if="!itemData.active" style="margin: 0;display: flex;align-items: center;flex-wrap: wrap;">-->
    <!--        <input type="checkbox"-->
    <!--               style="width: 20px;height: 20px;"-->
    <!--               :checked="itemData.active"-->
    <!--               @click="onBtnClickNodeShow"-->
    <!--        >-->
    <!--        显示节点-->
    <!--      </p>-->
    <!--    </ui-prop>-->
    <!--    &lt;!&ndash;颜色&ndash;&gt;-->
    <!--    <ui-prop name="color">-->
    <!--      <div style="display: flex;flex-direction: row;justify-content: center;">-->
    <!--        <div style="display: flex;flex:1;">-->

    <!--          <el-color-picker v-model="itemData.color" size="mini" style="flex:1;margin: 0;"-->
    <!--                           @change="changeColor"></el-color-picker>-->
    <!--        </div>-->
    <!--        <span style="width: 60px;">{{ itemData.color }}</span>-->

    <!--      </div>-->
    <!--    </ui-prop>-->
  </div>
</template>

<script lang="ts">
import Vue from "vue"
import {Component, Prop, Emit} from "vue-property-decorator"
import {} from 'vue-class-component'
import UiProp from './ui-prop.vue'
import {setup} from "vue-class-component/dist/vue-class-component";

@Component({
  components: {UiProp},
})
export default class NodeBaseProperty extends Vue {
  name: string = "node-base"

  // @Prop({required: false})
  // label: string = ''
  //
  // @Prop({required: false})
  // data: any = {};

  setup() {
    // computed({
    //   get: () => {
    //
    //   }
    // })
  }

  itemData: any = {};

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
    // console.log("change changePositionX:" + this.itemData.x);
    // console.log("change changePositionY:" + this.itemData.y);
    this._evalCode(
        "window.ccinspector.pluginSetNodePosition(" +
        "'" + this.itemData.uuid + "'," +
        "'" + this.itemData.x + "'," +
        "'" + this.itemData.y + "'" +
        ")");
    this._freshNode();
  }


  changeSize() {
    // console.log("change width:" + this.itemData.width);
    // console.log("change height:" + this.itemData.height);
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

<style scoped>
span {
  color: #fd942b;
}

.btnSize {
  padding: 5px 10px;
}

.comp {
  border: 2px solid #a1a1a1;
  padding: 5px 5px;
  background: #dddddd;
  width: 100%;
  border-radius: 5px;
  -moz-border-radius: 5px; /* 老的 Firefox */
}

.float-left {
  float: left;
}

.compBorder {
  border: 1px solid #b3b3b3;
  background: #ffffff
}

.myInput {
  width: 90%;
  border-radius: 5px;
  color: #fd942b;
}
</style>
