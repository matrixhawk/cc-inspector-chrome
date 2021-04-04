const Copy = require("./plugins/copy");
module.exports = {
  publicPath: "/",
  outputDir: "dist",
  pages: {
    popup: "src/popup/index.ts",
    options: "src/options/index.ts",
    devtools: "src/devtools/index.ts",
  },
  pluginOptions: {
    browserExtension: {
      extensionReloaderOptions: {
        reloadPage: false,
      },
      components: {
        background: true,
        contentScripts: true,
      },
      componentOptions: {
        contentScripts: {
          entries: {
            content: "src/content.ts",
            inject: "src/inject.js"
          },
        },
        background: {
          entry: "src/background.ts",
        }
      }
    }
  },
  configureWebpack: {
    plugins: [
      // new Copy([{src: "src/inject.js", dest: "js/inject.js"}]),
    ]
  }
};
