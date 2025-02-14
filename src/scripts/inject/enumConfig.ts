import { help } from "./connect-me";

declare const cc: any;

export function getEnumListConfig() {
  const enumConfig: Array<{
    type: any;
    list: Array<{
      key: string;
      values: () => Array<{ name: string; value: number }>;
    }>;
  }> = [
    {
      type: cc.Node,
      list: [
        {
          key: "layer",
          values() {
            return cc.Layers.BitMask.__bitmask__;
          },
        },
      ],
    },
    {
      type: cc.Widget,
      list: [
        {
          key: "alignMode",
          values: () => {
            return cc.Widget.AlignMode.__enums__;
          },
        },
      ],
    },
    {
      type: cc.Button,
      list: [
        {
          key: "transition",
          values: () => {
            return cc.Button.Transition.__enums__;
          },
        },
      ],
    },
    {
      type: cc.Sprite,
      list: [
        {
          key: "sizeMode",
          values: () => {
            return cc.Sprite.SizeMode.__enums__;
          },
        },
        {
          key: "type",
          values: () => {
            return cc.Sprite.Type.__enums__;
          },
        },
      ],
    },
    {
      type: cc.Mask,
      list: [
        {
          key: "type",
          values() {
            return cc.Mask.Type.__enums__;
          },
        },
      ],
    },
    {
      type: cc.Label,
      list: [
        {
          key: "cacheMode",
          values() {
            return cc.Label.CacheMode.__enums__;
          },
        },
        {
          key: "overflow",
          values() {
            return cc.Label.Overflow.__enums__;
          },
        },
        {
          key: "verticalAlign",
          values() {
            return cc.Label.VerticalAlign.__enums__;
          },
        },
        {
          key: "horizontalAlign",
          values() {
            return cc.Label.HorizontalAlign.__enums__;
          },
        },
      ],
    },
    {
      type: cc.Slider,
      list: [
        {
          key: "direction",
          values() {
            return cc.Slider.Direction.__enums__;
          },
        },
      ],
    },
    {
      type: cc.PageView,
      list: [
        {
          key: "direction",
          values() {
            return cc.PageView.Direction.__enums__;
          },
        },
        {
          key: "sizeMode",
          values() {
            return cc.PageView.SizeMode.__enums__;
          },
        },
      ],
    },
    {
      type: cc.PageViewIndicator,
      list: [
        {
          key: "direction",
          values() {
            return cc.PageViewIndicator.Direction.__enums__;
          },
        },
      ],
    },
    {
      type: cc.RichText,
      list: [
        {
          key: "cacheMode",
          values() {
            return cc.Label.CacheMode.__enums__;
          },
        },
        {
          key: "horizontalAlign",
          values() {
            return cc.RichText.HorizontalAlign.__enums__;
          },
        },
        {
          key: "verticalAlign",
          values() {
            return cc.RichText.VerticalAlign.__enums__;
          },
        },
      ],
    },
    {
      type: cc.ProgressBar,
      list: [
        {
          key: "mode",
          values() {
            return cc.ProgressBar.Mode.__enums__;
          },
        },
      ],
    },
    {
      type: cc.Scrollbar,
      list: [
        {
          key: "direction",
          values() {
            return cc.Scrollbar.Direction.__enums__;
          },
        },
      ],
    },
    {
      type: cc.EditBox,
      list: [
        {
          key: "inputMode",
          values() {
            return cc.EditBox.InputMode.__enums__;
          },
        },
        {
          key: "inputFlag",
          values() {
            return cc.EditBox.InputFlag.__enums__;
          },
        },
      ],
    },
    {
      type: cc.Layout,
      list: [
        {
          key: "resizeMode",
          values() {
            return cc.Layout.ResizeMode.__enums__;
          },
        },
        {
          key: "type",
          values() {
            return cc.Layout.Type.__enums__;
          },
        },
        {
          key: "startAxis",
          values() {
            return cc.Layout.AxisDirection.__enums__;
          },
        },
        {
          key: "horizontalDirection",
          values() {
            return cc.Layout.HorizontalDirection.__enums__;
          },
        },
        {
          key: "verticalDirection",
          values() {
            return cc.Layout.VerticalDirection.__enums__;
          },
        },
      ],
    },
    {
      type: cc.VideoPlayer,
      list: [
        {
          key: "resourceType",
          values() {
            return cc.VideoPlayer.ResourceType.__enums__;
          },
        },
      ],
    },
    {
      type: cc.Graphics,
      list: [
        {
          key: "lineJoin",
          values() {
            return cc.Graphics.LineJoin.__enums__;
          },
        },
        {
          key: "lineCap",
          values() {
            return cc.Graphics.LineCap.__enums__;
          },
        },
      ],
    },
    {
      type: cc.Camera,
      list: [
        {
          key: "clearFlags",
          values() {
            return adaptEnum(
              cc.Camera.ClearFlags || // TODO: 2x是个掩码，不是枚举
                cc.Camera.ClearFlag // 3.x是枚举
            );
          },
        },
        {
          key: "projection",
          values() {
            return cc.Camera.ProjectionType.__enums__;
          },
        },
        {
          key: "aperture",
          values() {
            return cc.Camera.Aperture.__enums__;
          },
        },
        {
          key: "shutter",
          values() {
            return cc.Camera.Shutter.__enums__;
          },
        },
        {
          key: "iso",
          values() {
            return cc.Camera.ISO.__enums__;
          },
        },
        // TODO: 有时间再优化可以复选的枚举选项
        // {
        //   key: "visibility",
        //   values() {
        //     return cc.Layers.BitMask.__bitmask__;
        //   },
        // },
      ],
    },
  ];
  return enumConfig;
}

function adaptEnum(list: any): Array<{ name: string; value: number }> {
  const target = list.__enums__;
  if (!target) {
    const arr = Object.keys(list).map((key) => {
      return {
        name: key,
        value: list[key],
      };
    });
    return arr;
  }
  if (!Array.isArray(target)) {
    help();
  }
  return target;
}
