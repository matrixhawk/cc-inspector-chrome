import { ArrayData, ImageData, Info, ObjectData, Vec2Data, Vec3Data } from "../../views/devtools/data";

export interface BuildObjectOptions {
  path: string[];
  value: Object;
  data: ObjectData;
}

export interface BuildArrayOptions {
  path: string[];
  value: Object;
  data: ArrayData;
  keys: number[];
}

export interface BuildVecOptions {
  path: string[];
  keys: Array<{
    key: string;
    /**
     * 分量使用的步进值，优先使用，主要是为了实现不同分量不同的步进
     */
    step?: (key: string) => number;
    /**
     * 分量是否可以调整
     */
    disabled?: (key: string, item: Info) => boolean;
  }>;
  /**
   * 所有的vec统一使用的步进值
   */
  step?: number;
  ctor: Function;
  value: Object;
  data: Vec3Data | Vec2Data;
}

export interface BuildImageOptions {
  path: string[];
  ctor: Function;
  value: Object;
  data: ImageData;
}
export enum ShowCode {
  TouchStart = "touchstart",
  TouchMove = "touchmove",
  TouchEnd = "touchend",
  TouchCancel = "touchcancel",
  ButtonClick = "buttonclick",
}
