#说明

inject在development模式下无法正常使用，暂时的解决办法，注释掉`vue-cli-plugin-browser-extension`代码中的
```
webpackConfig.plugin('extension-reloader').use(ExtensionReloader, [{ entries, ...extensionReloaderOptions }])
```
详细原因参考：[issues](https://github.com/adambullmer/vue-cli-plugin-browser-extension/issues/120)
