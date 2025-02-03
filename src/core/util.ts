import { Page } from "./types";

interface LogOptions {
  data: any;
  flag?: string;
  color?: "red" | "blue";
}

export function log(options: LogOptions) {
  const data: any = options.data;
  const time = new Date().toLocaleString();
  let log = "";
  if (typeof data === "string") {
    log = data;
  } else if (typeof data === "object") {
    log = JSON.stringify(data);
  }

  let str = "";
  if (options.flag) {
    str = `[${time}][${options.flag}]: ${log} `;
  } else {
    str = `[${time}]: ${log} `;
  }
  if (options.color) {
    console.log(`%c${str}`, `color:${options.color};`);
  } else {
    console.log(str);
  }
}

export function assembleDevToolsName(id: number) {
  return `${Page.Devtools}-${id}`;
}
export function getDevToolsInspectorId(name: string) {
  const id = name.split("-")[1];
  return id ? Number(id) : 0;
}
