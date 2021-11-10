const Copy = require("./plugins/copy");
const Path = require("path");
const TerserPlugin = require("terser-webpack-plugin");
console.log("***env: ", process.env.NODE_ENV);
let configureWebpack = {};
switch (process.env.NODE_ENV) {
  case "development": {
    configureWebpack = {
      mode: "development",
      devtool: "#source-map",
    };
    break;
  }
  case "production": {
    configureWebpack = {
      mode: "production",
      optimization: {
        minimizer: [
          new TerserPlugin({
            terserOptions: {
              compress: {
                drop_console: true, // 移除console
              }
            }
          })
        ]
      }
    };
    break;
  }
}

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
            content: "src/content.ts",
            inject: "src/inject/index.ts",
          },
        },
        background: {
          entry: "src/background.ts",
        }
      }
    }
  },
  configureWebpack,
};
