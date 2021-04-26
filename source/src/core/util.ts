export function injectScript(url: string) {
  if (chrome && chrome.extension && chrome.extension.getURL) {
    let content = chrome.extension.getURL(url)
    console.log(`[cc-inspector]注入脚本:${content}`);
    let script = document.createElement('script')
    script.setAttribute('type', 'text/javascript')
    script.setAttribute('src', content)
    script.onload = function () {
      document.body.removeChild(script);
    }
    document.body.appendChild(script)
  }
}
