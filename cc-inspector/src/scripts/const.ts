import { GA_EventName } from "../ga/type";

export enum DocumentEvent {
  /**
   * 从inject到content的事件
   */
  Inject2Content = "inject2content",
  /**
   * 从content到inject的事件
   */
  Content2Inject = "content2inject",
  EngineVersion = "engineVersion",
  GoogleAnalytics = "googleAnalytics",
  LoadInjectCss = "load-inject-css",
}
export interface GoogleAnalyticsData {
  event: GA_EventName;
  params: string;
}
