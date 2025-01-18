import { GA_EventName } from "../../ga/type";
import { DocumentEvent, GoogleAnalyticsData } from "../const";

export function ga(event: GA_EventName, params: string = "") {
  const detail = { event, params } as GoogleAnalyticsData;
  const e = new CustomEvent(DocumentEvent.GoogleAnalytics, { detail });
  document.dispatchEvent(e);
}
