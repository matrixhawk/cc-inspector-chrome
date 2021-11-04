import {ArrayData, ImageData, ObjectData, Vec2Data, Vec3Data} from "@/devtools/data";

export interface BuildDataOptions {
  path: string[];
  value: Object;
  data: ObjectData | ArrayData;
  keys: string[] | number[];
}

export interface BuildVecOptions {
  path: string[];
  keys: string[];
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
