import { HintAdapter, Point, RectPoints } from "./adapter";
declare const cc: any;

export class HintV3 extends HintAdapter {
  resetIndex(): void {
    const node = this.draw.node;
    const len = node.parent.children.length;
    node.setSiblingIndex(len);
  }
  hitTest(node: any, x: number, y: number): boolean {
    let b = node._uiProps?.uiTransformComp?.hitTest({ x, y }, 0);
    return b;
  }
  convertMousePos(event: MouseEvent, canvas: HTMLCanvasElement): { x: number; y: number } {
    const rect = canvas.getBoundingClientRect();
    let x = event.clientX - rect.x;
    let y = rect.y + rect.height - event.clientY;
    x *= window.devicePixelRatio;
    y *= window.devicePixelRatio;
    return { x, y };
  }
  protected addDraw(scene: any, canvas: any, node: any): void {
    if (canvas) {
      // 3.x 需要放到canvas下边
      if (canvas.layer) {
        node.layer = canvas.layer;
      }
      canvas.addChild(node);
    } else {
      scene.addChild(node);
    }
  }
  getRectPoints(node: any): RectPoints | null {
    if (!node.worldPosition) {
      return null;
    }
    const transform = cc.UITransformComponent || cc.UITransform;
    if (!transform) {
      return null;
    }
    const tr = node.getComponent(transform);
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
      const pos = this.draw.getComponent(transform).convertToNodeSpaceAR(cc.v3(worldX, worldY, worldZ));
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
