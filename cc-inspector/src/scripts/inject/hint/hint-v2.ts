import { HintAdapter, Point, RectPoints } from "./adapter";
declare const cc: any;

export class HintV2 extends HintAdapter {
  constructor() {
    super();
  }
  protected addDraw(scene: any, canvas: any, node: any): void {
    scene.addChild(node);
  }
  private canvasBoundingRect = {
    left: 0,
    top: 0,
    width: 0,
    height: 0,
  };
  private _updateCanvasBoundingRect() {
    // @ts-ignore
    const element: any = cc.game.canvas;
    var docElem = document.documentElement;
    var leftOffset = window.pageXOffset - docElem.clientLeft;
    var topOffset = window.pageYOffset - docElem.clientTop;
    if (element.getBoundingClientRect) {
      var box = element.getBoundingClientRect();
      this.canvasBoundingRect.left = box.left + leftOffset;
      this.canvasBoundingRect.top = box.top + topOffset;
      this.canvasBoundingRect.width = box.width;
      this.canvasBoundingRect.height = box.height;
    } else if (element instanceof HTMLCanvasElement) {
      this.canvasBoundingRect.left = leftOffset;
      this.canvasBoundingRect.top = topOffset;
      this.canvasBoundingRect.width = element.width;
      this.canvasBoundingRect.height = element.height;
    } else {
      this.canvasBoundingRect.left = leftOffset;
      this.canvasBoundingRect.top = topOffset;
      this.canvasBoundingRect.width = parseInt(element.style.width);
      this.canvasBoundingRect.height = parseInt(element.style.height);
    }
  }
  getPointByEvent(event: MouseEvent) {
    this._updateCanvasBoundingRect();
    if (event.pageX != null)
      //not avalable in <= IE8
      return { x: event.pageX, y: event.pageY };

    this.canvasBoundingRect.left -= document.body.scrollLeft;
    this.canvasBoundingRect.top -= document.body.scrollTop;

    return { x: event.clientX, y: event.clientY };
  }
  private hit(event: MouseEvent) {
    let location = this.getPointByEvent(event);
    // @ts-ignore
    cc.view._convertMouseToLocationInView(location, this.canvasBoundingRect);
  }
  resetIndex(): void {
    const node = this.draw.node;
    node.zIndex = node.parent.children.length;
  }
  getRectPoints(node: any): RectPoints | null {
    const points: RectPoints = new RectPoints();
    const { anchorX, anchorY, width, height } = node;
    const x = -anchorX * width;
    const y = -anchorY * height;
    const matrixm = node._worldMatrix.m;
    const m00 = matrixm[0],
      m01 = matrixm[1],
      m04 = matrixm[4],
      m05 = matrixm[5],
      m12_tx = matrixm[12],
      m13_ty = matrixm[13];
    [
      new Point(x, y), //
      new Point(x + width, y),
      new Point(x + width, y + height),
      new Point(x, y + height),
    ].forEach(({ x, y }: Point) => {
      const worldX = x * m00 + y * m04 + m12_tx; // x
      const worldY = x * m01 + y * m05 + m13_ty; // y
      const pos = this.draw.node.convertToNodeSpaceAR(cc.v2(worldX, worldY));
      points.add(new Point(pos.x, pos.y));
    });
    return points;
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
}
