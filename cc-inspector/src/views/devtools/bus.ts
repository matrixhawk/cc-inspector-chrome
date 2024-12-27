import { TinyEmitter } from "tiny-emitter";

export enum BusMsg {
  ShowPlace = "ShowPlace",
  RequestObjectData = "RequestObjectData",
  FoldAllGroup = "FoldAllGroup",
  UpdateSettings = "UpdateSettings",
}

export const Bus = new TinyEmitter();
