import { HintAdapter, Point, RectPoints } from "./adapter";
declare const cc: any;
export class HintV3 extends HintAdapter {
  resetIndex(): void {
    if (this.inspectorCanvas) {
      const len = this.inspectorCanvas.parent.children.length;
      this.inspectorCanvas.setSiblingIndex(len);
    }
  }
  private get transformComponent() {
    return cc.UITransformComponent || cc.UITransform;
  }
  hitTest(node: any, x: number, y: number): boolean {
    if (node === this.inspectorCanvas) {
      return false;
    }
    if (node.getComponent(cc.Canvas)) {
      // 因为Canvas会全屏，所以暂时不拾取，会干扰体验
      return false;
    }
    const tr = node.getComponent(this.transformComponent);
    if (tr) {
      const size = cc.view.getVisibleSize();
      if (tr.width >= size.width || tr.height >= size.height) {
        // 节点的区域非常大，并且没有渲染组件，在界面上看不到任何内容，也忽略掉
        // 有些背景遮罩使用的是单色透明图片，这种情况暂时没有好办法过滤掉
        const renderComp = [cc.Sprite, cc.Label].find((comp) => node.getComponent(comp));
        if (!renderComp) {
          return false;
        }
      }
    }

    let hitTest = null;
    if (tr) {
      if (tr.hitTest) {
        hitTest = tr.hitTest.bind(tr);
      } else if (tr.isHit) {
        // TODO: 3.3.1使用的是这个接口，hitTest有问题，有人反馈再说修复，老版本暂不花费太多精力
        hitTest = tr.isHit.bind(tr);
      }
    }
    if (hitTest) {
      let b = hitTest({ x, y }, 0);
      return b;
    } else {
      return false;
    }
  }
  convertMousePos(event: MouseEvent, canvas: HTMLCanvasElement): { x: number; y: number } {
    const rect = canvas.getBoundingClientRect();
    let x = event.clientX - rect.x;
    let y = rect.y + rect.height - event.clientY;
    x *= window.devicePixelRatio;
    y *= window.devicePixelRatio;
    return { x, y };
  }
  /**
   *  这种方式能够获取到优先绘制的canvas，也能保证线框在顶部，但是方案不完美，会受到node.layer的影响
   */
  private getCanvas(scene: any) {
    const canvasArray: Array<{ canvas: any; index: number }> = [];
    scene.walk((item: any) => {
      if (cc.Canvas) {
        const comp = item.getComponent(cc.Canvas);
        if (comp) {
          const idx = comp.cameraComponent?.priority || 0;
          canvasArray.push({ canvas: comp, index: idx });
        }
      }
    });
    if (canvasArray.length) {
      canvasArray.sort((a, b) => a.index - b.index);
      return canvasArray[0].canvas.node;
    }
    return null;
  }
  private inspectorCanvas: any = null;
  protected addDraw(scene: any, graphicsNode: any): boolean {
    graphicsNode.layer = this.getLayerID();
    const tr = graphicsNode.getComponent(this.transformComponent) || graphicsNode.addComponent(this.transformComponent);
    if (tr) {
      tr.setContentSize(0, 0);
    }

    const inspectorCanvas = this.createInspectorCanvas();
    scene.addChild(inspectorCanvas);

    const camera = this.createCamera();
    inspectorCanvas.addChild(camera.node);
    inspectorCanvas.addChild(graphicsNode);

    const canvas = inspectorCanvas.addComponent(cc.Canvas);
    canvas.cameraComponent = camera;
    canvas.alignCavasWithScreen = true;
    this.inspectorCanvas = inspectorCanvas;
    return true;
  }
  private createInspectorCanvas() {
    const node = new cc.Node("InspectorCanvas");
    node.layer = this.getLayerID();
    const widget = node.addComponent(cc.Widget);
    widget.alignMode = cc.Widget.AlignMode.ALWAYS;
    widget.isAlignBottom = true;
    widget.isAlignTop = true;
    widget.isAlignLeft = true;
    widget.isAlignRight = true;
    widget.left = widget.right = widget.top = widget.bottom = 0;

    return node;
  }
  private createCamera() {
    const node = new cc.Node("InspectorCamera");
    node.layer = this.getLayerID();
    const camera = node.addComponent(cc.Camera);
    camera.priority = Number.MAX_VALUE;
    camera.layer = this.getLayerID();
    camera.visibility = this.getLayerID();
    camera.clearFlags = cc.Camera.ClearFlag.DONT_CLEAR;
    camera.clearColor = new cc.Color(0, 0, 0, 0);
    camera.projection = cc.Camera.ProjectionType.ORTHO;
    camera.far = 2000;
    return camera;
  }
  private getLayerID() {
    // FIXME: https://forum.cocos.org/t/topic/165550
    return cc.Layers.Enum.GIZMOS;
  }
  getRectPoints(node: any): RectPoints | null {
    if (!node.worldPosition) {
      return null;
    }
    if (!this.transformComponent) {
      return null;
    }
    const tr = node.getComponent(this.transformComponent);
    if (!tr) {
      return null;
    }
    const { anchorPoint, width, height } = tr;
    const points: RectPoints = new RectPoints();
    const x = -anchorPoint.x * width;
    const y = -anchorPoint.y * height;
    const m = node.worldMatrix;

    [
      new Point(x, y), //
      new Point(x + width, y),
      new Point(x + width, y + height),
      new Point(x, y + height),
    ].forEach(({ x, y }: Point) => {
      let rhw = m.m03 * x + m.m07 * y + m.m15;
      rhw = rhw ? 1 / rhw : 1;
      let worldX = (m.m00 * x + m.m04 * y + m.m12) * rhw;
      let worldY = (m.m01 * x + m.m05 * y + m.m13) * rhw;
      let worldZ = (m.m02 * x + m.m06 * y + m.m14) * rhw;
      const pos = this.draw.getComponent(this.transformComponent).convertToNodeSpaceAR(cc.v3(worldX, worldY, worldZ));
      points.add(new Point(pos.x, pos.y));
    });

    return points;
  }
  /**
   *  尝试实现wireframe模式
   */
  private getTrangles(node: any) {
    const comps = node._components;
    if (comps && Array.isArray(comps)) {
      const m = node.worldMatrix;
      comps.forEach((comp) => {
        const { renderData } = comp;
        if (!renderData) {
          return;
        }
        const { data, _vc: VertexCount, _ic: IndexCount, chunk } = renderData;
        if (!data) {
          return;
        }

        // 获取indexBuffer的索引顺序
        const ib = chunk.meshBuffer.iData;
        let indexOffset = chunk.meshBuffer.indexOffset;
        const vidOrigin = chunk.vertexOffset;
        const arr = [];
        for (let i = 0; i < IndexCount; i++) {
          const index = ib[indexOffset + i] - vidOrigin;
          arr.push(index);
        }

        for (let j = 0; j < data.length; j++) {
          const item = data[j];
          const { x, y, z, u, v, color } = item;
          let rhw = m.m03 * x + m.m07 * y + m.m15;
          rhw = rhw ? 1 / rhw : 1;

          let worldX = (m.m00 * x + m.m04 * y + m.m12) * rhw;
          let worldY = (m.m01 * x + m.m05 * y + m.m13) * rhw;
          let worldZ = (m.m02 * x + m.m06 * y + m.m14) * rhw;
          // const pos = this.draw.getComponent(transform).convertToNodeSpaceAR(cc.v3(worldX, worldY, worldZ));
          // points.points.push(new Point(pos.x, pos.y));
        }
      });
    }
  }
}
