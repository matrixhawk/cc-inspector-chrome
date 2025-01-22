declare const cc: any;
class Point {
  x: number;
  y: number;
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}
class RectPoints {
  points: Point[] = [];
  get len() {
    return this.points.length;
  }
  at(index: number) {
    return this.points[index];
  }
  test(width: number, height: number) {
    this.points.push(new Point(0, 0));
    this.points.push(new Point(width, 0));
    this.points.push(new Point(width, height));
    this.points.push(new Point(0, height));
  }
}
interface DrawOptions {
  fill: boolean;
  fillColor: string;
  stroke: boolean;
  strokeColor: string;
}
export class Hint {
  private draw = null;
  public engineVersion: string = "";
  private get isEngineV2() {
    return this.engineVersion.startsWith("2.");
  }
  private get isEngineV3() {
    return this.engineVersion.startsWith("3.");
  }
  public cleanHover() {
    this.hoverNodes = [];
    if (this.draw) {
      this.draw.clear();
    }
  }
  public cleanSelected() {
    this.selectedNodes = [];
    if (this.draw) {
      this.draw.clear();
    }
  }
  private initDrawNode() {
    if (this.draw && !this.draw.isValid) {
      this.draw = null;
    }
    if (this.draw) {
      return;
    }
    const scene = cc.director.getScene();
    if (!scene) {
      return;
    }
    let node = new cc.Node("draw-node");
    const canvas = cc.find("Canvas");
    if (canvas) {
      // 3.x 需要放到canvas下边
      if (canvas.layer) {
        node.layer = canvas.layer;
      }
      canvas.addChild(node);
    } else {
      scene.addChild(node);
    }
    this.draw = node.addComponent(cc.Graphics);
  }
  private hoverNodes = [];
  private selectedNodes = [];
  private resetIndex() {
    if (this.isEngineV3) {
      const len = this.draw.node.parent.children.length;
      this.draw.node.setSiblingIndex(len);
    } else if (this.isEngineV2) {
    }
  }
  public update() {
    this.initDrawNode();
    if (!this.draw) {
      return;
    }
    this.draw.clear();
    this.resetIndex();
    // this.testRect();
    this.hoverNodes.forEach((node) => {
      if (node.isValid) {
        this.hintNode(node, {
          fill: true,
          fillColor: "#00ff0055",
          stroke: true,
          strokeColor: "#ffffff44",
        });
      }
    });
    this.selectedNodes.forEach((node) => {
      if (node.isValid) {
        this.hintNode(node, {
          fill: false,
          fillColor: "#ff0000",
          stroke: true,
          strokeColor: "#ff0000",
        });
      }
    });
  }
  private testRect() {
    const points = new RectPoints();
    points.test(100, 100);
    this.drawRect(points, {
      fill: true,
      fillColor: "#00ff0099",
      stroke: true,
      strokeColor: "#ff000099",
    });
  }
  public setHover(node: any) {
    this.hoverNodes = [node];
  }
  public setSelected(node: any) {
    this.selectedNodes = [node];
  }
  private getRectPoints(node: any): RectPoints | null {
    if (this.isEngineV2) {
      const points: RectPoints = new RectPoints();
      return points;
    } else if (this.isEngineV3) {
      // v3版本
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
        points.points.push(new Point(pos.x, pos.y));
      });

      return points;
    }
    return null;
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
  private getBox(node: any) {
    if (node.getBoundingBoxToWorld) {
      return node.getBoundingBoxToWorld();
    }

    if (cc.UITransformComponent) {
      const tr = node.getComponent(cc.UITransformComponent);
      if (tr && tr.getBoundingBoxToWorld) {
        return tr.getBoundingBoxToWorld();
      }
    }
    return null;
  }
  private hintNode(node: any, opts: DrawOptions) {
    const points = this.getRectPoints(node);
    if (!points) {
      return;
    }
    this.drawRect(points, opts);
  }

  private drawRect(points: RectPoints, opts: DrawOptions) {
    this.draw.lineWidth = 2;
    for (let i = 0; i < points.len; i++) {
      const p = points.at(i);
      if (i === 0) {
        this.draw.moveTo(p.x, p.y);
      } else {
        this.draw.lineTo(p.x, p.y);
      }
    }
    this.draw.close();
    if (opts.stroke) {
      this.draw.strokeColor = new cc.Color().fromHEX(opts.strokeColor);
      this.draw.stroke();
    }
    if (opts.fill) {
      this.draw.fillColor = new cc.Color().fromHEX(opts.fillColor);
      this.draw.fill();
    }
  }
  private fillRect(points: RectPoints, color: string) {
    this.draw.fillColor = new cc.Color().fromHEX(color);
    for (let i = 0; i < points.len; i++) {
      const p = points.at(i);
      if (i === 0) {
        this.draw.moveTo(p.x, p.y);
      } else {
        this.draw.lineTo(p.x, p.y);
      }
    }
    this.draw.close();
    this.draw.fill();
  }
}
