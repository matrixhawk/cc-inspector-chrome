import ccui from "@xuyanfeng/cc-ui";
import { IUiMenuItem } from "@xuyanfeng/cc-ui/types/cc-menu/const";
import { throttle } from "lodash";
import { toRaw } from "vue";
import { Msg } from "../../../core/types";
import { DocumentEvent } from "../../const";
import { appStore } from "../../inject-view/store";
import { Inspector } from "../inspector";
import { DrawOptions, HintAdapter, RectPoints } from "./adapter";
import { HintV2 } from "./hint-v2";
import { HintV3 } from "./hint-v3";
declare const cc: any;

/**
 * 只负责管理hint的流程
 */
export class Hint {
  private engineVersion: string = "";
  private hintAdapter: HintAdapter = null;
  public setEngineVersion(version: string) {
    this.engineVersion = version;
    if (version.startsWith("2.")) {
      this.hintAdapter = new HintV2();
    } else if (version.startsWith("3.")) {
      this.hintAdapter = new HintV3();
    }
  }
  private inspector: Inspector = null;
  constructor(inspector: Inspector) {
    this.inspector = inspector;
    document.addEventListener(DocumentEvent.GameInspectorBegan, (event: CustomEvent) => {
      const el = this.getTargetElement();
      if (!el) {
        return;
      }

      const cursor = el.style.cursor;
      el.style.cursor = "zoom-in";

      const mousedown = (event: MouseEvent) => {
        event.stopPropagation();
        event.preventDefault();
        el.removeEventListener("mousedown", mousedown, true);
        el.removeEventListener("mousemove", mousemove, true);
        el.style.cursor = cursor;
        const e = new CustomEvent(DocumentEvent.GameInspectorEnd);
        document.dispatchEvent(e);

        if (event.button === 0) {
          // 左键拾取
          this.updateHintDown(event, el);
        } else {
          this.updateHitMoveThrottle.cancel();
          // 其他按键取消
          this.cleanHover();
        }
      };
      const mousemove = (event: MouseEvent) => {
        this.updateHitMoveThrottle(event, el);
      };

      el.addEventListener("mousemove", mousemove, true);
      el.addEventListener("mousedown", mousedown, true);
    });
  }
  private updateHitMoveThrottle = throttle(this.updateHintMove, 300);
  private updateHintMove(event: MouseEvent, canvas: HTMLCanvasElement) {
    const nodes = this.getMouseNodes(event, canvas);
    if (nodes.length) {
      const node = nodes[0];
      this.setHover(node);
    }
  }
  private getMouseNodes(event: MouseEvent, canvas: HTMLCanvasElement): Array<any> {
    this.inspector.updateTreeInfo(false);
    const { x, y } = this.hintAdapter.convertMousePos(event, canvas);
    const nodes = [];
    this.inspector.forEachNode((node) => {
      const b = this.hintAdapter.hitTest(node, x, y);
      if (b && node.active && node.activeInHierarchy) {
        nodes.push(node);
      }
    });
    nodes.reverse();
    return nodes;
  }
  private updateHintDown(event: MouseEvent, canvas: HTMLCanvasElement) {
    this.cleanHover();
    this.cleanSelected();
    const nodes = this.getMouseNodes(event, canvas);
    const pickTop = toRaw(appStore().config.pickTop);
    if (nodes.length === 1 || pickTop) {
      const item = nodes[0];
      this.cleanHover();
      this.setSelected(item);
      this.sendInspectNodeMsg(item);
    } else {
      const menu = nodes.map((item) => {
        const path = this.getPath(item);
        return {
          name: path,
          callback: () => {
            this.cleanHover();
            this.setSelected(item);
            this.sendInspectNodeMsg(item);
          },
          enter: () => {
            this.setHover(item);
          },
          leave: () => {
            this.cleanHover();
          },
        } as IUiMenuItem;
      });
      ccui.menu.showMenuByMouseEvent(event, menu, 0.8);
    }
  }
  private sendInspectNodeMsg(node: any) {
    if (node.uuid) {
      this.inspector.sendMsgToContent(Msg.InspectNode, node.uuid);
    }
  }
  private getPath(node: any) {
    let path = [];
    let parent = node;
    while (parent) {
      path.push(parent.name);
      parent = parent.parent;
    }
    path = path.reverse();
    return path.join("/");
  }
  private getTargetElement(): HTMLCanvasElement | null {
    // @ts-ignore
    if (typeof cc !== "undefined" && cc.game && cc.game.canvas) {
      // @ts-ignore
      return cc.game.canvas;
    } else {
      null;
    }
  }
  public cleanHover() {
    this.hoverNodes = [];
    this.hintAdapter.clear();
  }
  public cleanSelected() {
    this.selectedNodes = [];
    this.hintAdapter.clear();
  }
  private hoverNodes = [];
  private selectedNodes = [];

  public update() {
    this.hintAdapter.initDrawNode();
    if (!this.hintAdapter.isDrawValid()) {
      return;
    }
    this.hintAdapter.clear();
    this.hintAdapter.resetIndex();
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
    this.hintAdapter.drawRect(points, {
      fill: true,
      fillColor: "#00ff0099",
      stroke: true,
      strokeColor: "#ff000099",
    });
  }
  public setHover(node: any) {
    if (node.isValid) {
      this.hoverNodes = [node];
    }
  }
  public setSelected(node: any) {
    if (node.isValid) {
      this.selectedNodes = [node];
    }
  }

  private hintNode(node: any, opts: DrawOptions) {
    const points = this.hintAdapter.getRectPoints(node);
    if (!points) {
      return;
    }
    this.hintAdapter.drawRect(points, opts);
  }
}
