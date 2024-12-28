import { TinyEmitter } from "tiny-emitter";

export enum BusMsg {
  ShowPlace = "ShowPlace",
  RequestObjectData = "RequestObjectData",
  FoldAllGroup = "FoldAllGroup",
  UpdateSettings = "UpdateSettings",
  /**
   * 开关定时器，方便测试
   */
  EnableSchedule = "EnableSchedule",
}

export const Bus = new TinyEmitter();
