import { GA_EventName } from "../../ga/type";
import { DocumentEvent, GoogleAnalyticsData } from "../const";

export function ga(event: GA_EventName, params: string = "") {
  const detail = { event, params } as GoogleAnalyticsData;
  const e = new CustomEvent(DocumentEvent.GoogleAnalytics, { detail });
  document.dispatchEvent(e);
}

export function transformSize(size: number) {
  if (!size) return "0B";
  size = parseInt(size.toString());
  if (size < 1024) {
    return size + "B";
  }
  size = size / 1024;
  if (size < 1024) {
    return size.toFixed(2) + "KB";
  }
  size = size / 1024;
  if (size < 1024) {
    return size.toFixed(2) + "MB";
  }
  size = size / 1024;
  if (size < 1024) {
    return size.toFixed(2) + "GB";
  }
  return size;
}
