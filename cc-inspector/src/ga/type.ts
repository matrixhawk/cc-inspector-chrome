/**
 * 发送的消息数据结构
 *
 * @doc https://developers.google.com/analytics/devguides/collection/protocol/ga4/reference?hl=zh-cn&client_type=gtag#payload_post_body
 * @github https://github.dev/GoogleChrome/chrome-extensions-samples/blob/main/functional-samples/tutorial.google-analytics/scripts/google-analytics.js#L69
 */
export interface MeasurementBody {
  /**
   * 用户的ID，用于标识用户
   */
  client_id: string;
  /**
   * 用户的唯一标识，只能包含 utf-8 字符。
   */
  user_id?: string;
  /**
   * 事件相关联的时间的 UNIX 时间戳，此值应仅设置为记录过去发生的事件。
   */
  timestamp_micros?: number;
  /**
   * 用户属性用于描述用户群细分，例如语言偏好设置或地理位置。
   *
   * @doc https://developers.google.com/analytics/devguides/collection/protocol/ga4/user-properties?hl=zh-cn&client_type=gtag
   */
  user_properties?: Object;
  /**
   * 用户提供的数据。
   *
   *@doc https://developers.google.com/analytics/devguides/collection/ga4/uid-data?hl=zh-cn
   */
  user_data?: Object;
  /**
   * 设置请求的用户意见征求设置。
   * @doc https://developers.google.com/analytics/devguides/collection/protocol/ga4/reference?hl=zh-cn&client_type=gtag#payload_consent
   */
  consent?: Object;
  /**
   * 每个请求最多可以发送 25 个事件
   */
  events?: MeasurementEvent[];
}
export interface MeasurementEvent {
  /**
   * 事件的名称。
   *
   * Google提供的事件： https://developers.google.com/analytics/devguides/collection/protocol/ga4/reference/events?hl=zh-cn#add_payment_info
   * 预留的事件名：https://developers.google.com/analytics/devguides/collection/protocol/ga4/reference?hl=zh-cn&client_type=gtag#reserved_event_names
   */
  name: string;
  /**
   * 预留的参数名：https://developers.google.com/analytics/devguides/collection/protocol/ga4/reference?hl=zh-cn&client_type=gtag#reserved_parameter_names
   */
  params?: {
    [key: string]: any;
    /**
     * 在实时报告中查看事件，需要该参数
     */
    session_id?: string;
    /**
     * 事件的互动时长（以毫秒为单位）
     */
    engagement_time_msec?: string;
  };
}
export interface GA_Event_PageView extends MeasurementEvent {
  name: "page_view";
  params: {
    page_title: string;
    page_location: string;
  };
}

export enum GA_EventName {
  ButtonClicked = "button_clicked",
  PageView = "page_view",
  SpaceVisible = "space_visible",
  MouseMenu = "mouse_menu",
  Hierarchy = "hierarchy",
  Inspector = "Inspector",
}
export enum GA_Button {
  Github = "github",
  Issues = "issues",
  QQ = "qq",
  /**
   * 当页面不支持cocos时，用户手动点击了刷新
   */
  FreshManual = "fresh-manual",
}
