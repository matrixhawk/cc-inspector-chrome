<template>
  <div id="app" style="height: 30px;overflow: hidden;width: 100%;">
    <div style="width: 20%;float: left;background-color: #4a4a4a;text-align: left;"
         @mousedown="changePositionMouseAction"
         onselectstart="return false;"
         class="noselect">
      <span onselectstart="return false;" class="noselect font"
            style="line-height: 30px;color: #bdbdbd;font-size: 12px;margin: 3px;">
        {{ name }}
      </span>
    </div>
    <div style=" float:left;background-color: #4a4a4a;width: 80%;height:100%;text-align: left;">
      <div style="line-height: 30px;height: 100%;">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue"
import {Component, Prop} from "vue-property-decorator"

@Component({})
export default class UiProp extends Vue {
  @Prop()
  name: string = '';

  @Prop()
  step: number = 1;

  clientX: number = 0;

  changePositionMouseAction(event: MouseEvent) {
    document.addEventListener("mousemove", this._onMouseMove);
    document.addEventListener("mouseup", this._onMouseUp);
    document.addEventListener("onselectstart", this._onSelect);
  }

  _onSelect() {
    return false;
  }

  _onMouseMove(event: MouseEvent) {
    let x = event.clientX;
    let calcStep = this.step;
    if (x > this.clientX) {
      calcStep = Math.abs(calcStep);
    } else {
      calcStep = -Math.abs(calcStep);
    }
    this.$emit("movestep", calcStep);
    this.clientX = x;
  }

  _onMouseUp(event: MouseEvent) {
    document.removeEventListener("mousemove", this._onMouseMove);
    document.removeEventListener("mouseup", this._onMouseUp);
    document.removeEventListener("onselectstart", this._onSelect);
  }


};
</script>

<style scoped>
.font {
  font-family: BlinkMacSystemFont, 'Helvetica Neue', Helvetica, 'Lucida Grande', 'Segoe UI', Ubuntu, Cantarell, 'SourceHanSansCN-Normal', Arial, sans-serif
}

.noselect {
  -webkit-touch-callout: none; /* iOS Safari */
  -webkit-user-select: none; /* Chrome/Safari/Opera */
  -khtml-user-select: none; /* Konqueror */
  -moz-user-select: none; /* Firefox */
  -ms-user-select: none; /* Internet Explorer/Edge */
  user-select: none;
  /* Non-prefixed version, currently
 not supported by any browser */
}
</style>
