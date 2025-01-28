declare const cc: any;
export interface DrawOptions {
  fill: boolean;
  fillColor: string;
  stroke: boolean;
  strokeColor: string;
}
export class Point {
  x: number;
  y: number;
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}
export class RectPoints {
  points: Point[] = [];
  get len() {
    return this.points.length;
  }
  add(point: Point) {
    this.points.push(point);
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
export class HintAdapter {
  protected draw = null;
  constructor() {}
  resetIndex() {
    throw new Error("not implemented");
  }
  getRectPoints(node: any): RectPoints | null {
    throw new Error("not implemented");
  }
  clear() {
    if (this.draw) {
      this.draw.clear();
    }
  }
  convertMousePos(event: MouseEvent, canvas: HTMLCanvasElement): { x: number; y: number } {
    throw new Error("not implemented");
  }
  hitTest(node: any, x: number, y: number): boolean {
    throw new Error("not implemented");
  }
  initDrawNode() {
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
    this.addDraw(scene, node);
    this.draw = node.addComponent(cc.Graphics || cc.GraphicsComponent);
  }
  public isDrawValid() {
    return this.draw && this.draw.isValid;
  }
  protected addDraw(scene: any, node: any) {
    throw new Error("not implemented");
  }
  public drawRect(points: RectPoints, opts: DrawOptions) {
    this.draw.lineWidth = 2;
    for (let i = 0; i < points.len; i++) {
      const p = points.at(i);
      if (i === 0) {
        this.draw.moveTo(p.x, p.y);
      } else {
        this.draw.lineTo(p.x, p.y);
      }
    }
    if (points.len) {
      this.draw.close();
    }
    if (opts.stroke) {
      this.draw.strokeColor = new cc.Color().fromHEX(opts.strokeColor);
      this.draw.stroke();
    }
    if (opts.fill) {
      this.draw.fillColor = new cc.Color().fromHEX(opts.fillColor);
      this.draw.fill();
    }
  }
}
