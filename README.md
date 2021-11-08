#说明

inject在development模式下无法正常使用，暂时的解决办法，注释掉`vue-cli-plugin-browser-extension/index.js`代码中的124行：
```
webpackConfig.plugin('extension-reloader').use(ExtensionReloader, [{ entries, ...extensionReloaderOptions }])
```
详细原因参考：[issues](https://github.com/adambullmer/vue-cli-plugin-browser-extension/issues/120)

# 后续工作

popup界面增加联系方式。

开发一个独立的electron桌面版本，使用socket调试app，解决排查app问题的痛点。
防止别人篡改，必须混淆代码，增加修改难度，暂时不做加密。

适配插件版本(不紧急)



