const ChromeManifest = require("./plugins/chrome-manifest");
const Path = require("path");
module.exports = {
  publicPath: "/",
  outputDir: "dist",
  pages: {
    popup: {
      entry: "src/popup/index.ts",
      template: "public/index.html",
      filename: "popup.html",
      title: "popup",
    },
    options: "src/options/index.ts",
    devtools: "src/devtools/index.ts",
    test: "src/test/index.ts",
  },
  configureWebpack: {
    entry: {
      content: Path.join(__dirname, "src/content.ts"),
      options: Path.join(__dirname, "src/options.ts"),
    },
    output: {
      filename: "js/[name].js?t=[hash]"
    },
    plugins: [
      new ChromeManifest({
        manifest: Path.join(__dirname, "src/manifest/index.js")
      }),
    ]
  }
};
