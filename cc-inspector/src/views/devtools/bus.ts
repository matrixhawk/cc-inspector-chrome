import { TinyEmitter } from 'tiny-emitter';

export enum BusMsg {
  ShowPlace = "ShowPlace",
  RequestObjectData = "RequestObjectData",
  LogData = "LogData",
  FoldAllGroup = "FoldAllGroup",
  UpdateSettings = "UpdateSettings",
}

export default new TinyEmitter();
