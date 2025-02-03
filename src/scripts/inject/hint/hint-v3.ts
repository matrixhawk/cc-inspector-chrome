import { HintAdapter, Point, RectPoints } from "./adapter";
declare const cc: any;

export class HintV3 extends HintAdapter {
  resetIndex(): void {
    const node = this.draw.node;
    if (node.parent) {
      const len = node.parent.children.length;
      node.setSiblingIndex(len);
    }
  }
  private get transformComponent() {
    return cc.UITransformComponent || cc.UITransform;
  }
  hitTest(node: any, x: number, y: number): boolean {
    let hitTest = null;
    // hitTest = node._uiProps?.uiTransformComp?.hitTest;
    const tr = node.getComponent(this.transformComponent);
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
   *  这种方式能够获取到优先绘制的canvas，也能保证线框在顶部，但是方案不完美，会收到node.layer的影响
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
    canvasArray.sort((a, b) => a.index - b.index);
    return canvasArray[0].canvas.node;
  }
  protected addDraw(scene: any, node: any): void {
    const canvas = this.getCanvas(scene);
    if (canvas) {
      if (canvas.layer) {
        node.layer = canvas.layer;
      }
      const tr = node.getComponent(this.transformComponent) || node.addComponent(this.transformComponent);
      if (tr) {
        tr.setContentSize(0, 0);
      }
      // FIXME: 多canvas的情况下，如果hover和select的节点不在一个canvas下，绘制线框有问题，暂时先不支持多canvas的情况
      canvas.addChild(node);
    }
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
