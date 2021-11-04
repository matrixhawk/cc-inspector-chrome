export function injectScript(url: string) {
  if (chrome && chrome.extension && chrome.extension.getURL) {
    let content = chrome.extension.getURL(url)
    console.log(`[cc-inspector]注入脚本:${content}`);
    const script = document.createElement("script")
    script.setAttribute("type", "text/javascript")
    script.setAttribute("src", content)
    script.onload = function () {
      document.body.removeChild(script);
    }
    document.body.appendChild(script)
  }
}


interface LogOptions {
  data: any;
  flag?: string;
  color?: "red" | "blue";
}

export function log(options: LogOptions) {
  const data: any = options.data;
  const time = new Date().toLocaleString()
  let log = ""
  if (typeof data === "string") {
    log = data;
  } else if (typeof data === "object") {
    log = JSON.stringify(data)
  }

  let str = "";
  if (options.flag) {
    str = `[${time}][${options.flag}]: ${log} `;
  } else {
    str = `[${time}]: ${log} `;
  }
  if (options.color) {
    console.log(`%c${str}`, `color:${options.color};`)
  } else {
    console.log(str);
  }
}
