const Fs = require("fs");
const Path = require("path");
const FsExtra = require("fs-extra");

class Copy {
  constructor(options) {
    this.options = options;
  }

  apply(compiler) {
    compiler.plugin("done", (compilation, callback) => {
      const cfg = this.options;
      if (cfg && cfg.length > 0) {
        cfg.forEach(({src, dest}) => {
          let fullSrc = Path.join(compilation.compilation.options.context, src);
          if (Fs.existsSync(fullSrc)) {
            let distPath = compilation.compilation.options.output.path;
            let outFile = Path.join(distPath, dest);
            FsExtra.ensureFileSync(outFile);
            FsExtra.copyFileSync(fullSrc, outFile);
          } else {
            console.error(`manifest文件不存在：${src}`);
          }
        });
      }
    });

  }
}

module.exports = Copy;
