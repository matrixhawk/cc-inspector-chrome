import ccui from "@xuyanfeng/cc-ui";
import { IUiMenuItem } from "@xuyanfeng/cc-ui/types/cc-menu/const";
import { DocumentEvent } from "../../const";
import { Inspector } from "../inspector";
import { Msg } from "../../../core/types";
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
      const test = (event: MouseEvent) => {
        event.stopPropagation();
        event.preventDefault();
        el.removeEventListener("mousedown", test, true);
        el.style.cursor = cursor;
        const e = new CustomEvent(DocumentEvent.GameInspectorEnd);
        document.dispatchEvent(e);
        this.updateHint(event, el);
      };
      el.addEventListener("mousedown", test, true);
    });
  }

  private updateHint(event: MouseEvent, canvas: HTMLCanvasElement) {
    this.cleanHover();
    this.cleanSelected();
    const rect = canvas.getBoundingClientRect();
    let x = event.clientX - rect.x;
    let y = rect.y + rect.height - event.clientY;
    x *= window.devicePixelRatio;
    y *= window.devicePixelRatio;

    this.inspector.updateTreeInfo(false);
    const nodes = [];
    this.inspector.forEachNode((item) => {
      let b = false;
      if (this.inspector.isCreatorV3) {
        b = item._uiProps?.uiTransformComp?.hitTest({ x, y }, 0);
      } else {
      }
      if (b && item.active && item.activeInHierarchy) {
        nodes.push(item);
      }
    });

    if (nodes.length === 1) {
      const item = nodes[0];
      this.setSelected(item);
      this.sendInspectNodeMsg(item);
    } else {
      nodes.reverse();
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
