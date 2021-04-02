const Fs = require("fs");
const Path = require("path");
const FsExtra = require("fs-extra");

class ChromeManifest {
  constructor(options) {
    this.options = options;
  }

  apply(compiler) {
    compiler.plugin("done", function (compilation, callback) {
      const {manifest} = this.options;
      if (manifest) {
        if (Fs.existsSync(manifest)) {
          // 生成manifest.json
          let data = require(manifest);
          let distPath = compilation.compilation.options.output.path;
          let outFile = Path.join(distPath, "manifest.json");
          Fs.writeFileSync(outFile, JSON.stringify(data, null, 4));
          console.log(`生成manifest文件: ${outFile}`);

          // 复制图片
          const manifestDir = Path.dirname(manifest);
          if (data.icons) {
            for (let key in data.icons) {
              let icon = data.icons[key];
              let iconPath = Path.join(manifestDir, icon);
              if (Fs.existsSync(iconPath)) {
                FsExtra.copySync(iconPath, Path.join(distPath, icon), {overwrite: true});
                console.log(`copy res: ${icon}`);
              }
            }
          }
        } else {
          console.error(`manifest文件不存在：${manifest}`);
        }
      } else {
        console.log("缺少插件的manifest信息");
      }
    }.bind(this));

  }
}

module.exports = ChromeManifest;
