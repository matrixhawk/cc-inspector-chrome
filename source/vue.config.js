const Path = require("path");

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
      components: {
        background: true,
        contentScripts: true,
      },
      componentOptions: {
        contentScripts: {
          entries: {
            content: "src/content.ts"
          },
        },
        background: {
          entry: "src/background.ts",
        }
      }
    }
  },
  configureWebpack: {
    mode: "development",
    devtool: "#source-map",
    entry: {
      inject: Path.join(__dirname, "src/inject.js"),
    }
  }
};
