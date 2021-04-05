// content.js 和原始界面共享DOM，具有操作dom的能力
// 但是不共享js,要想访问页面js,只能通过注入的方式
import * as PluginMsg from './core/plugin-msg'

function injectScriptToPage(url: string) {
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

injectScriptToPage("js/inject.js");

// 和background.js保持长连接通讯
let conn = chrome.runtime.connect({name: PluginMsg.Page.Content})
conn.onMessage.addListener(function (data) {
  // 将background.js的消息返回到injection.js
  console.log(`%c[Connect-Message] ${JSON.stringify(data)}`, "color:green;")
  window.postMessage(data, "*");
})
// 接受来自inject.js的消息数据,然后中转到background.js
window.addEventListener('message', function (event) {
  let data = event.data;
  console.log(`%c[Window-Message] ${JSON.stringify(data)}`, "color:green;");
  chrome.runtime.sendMessage(data);
}, false);


let gameCanvas = document.querySelector("#GameCanvas");
if (gameCanvas) {
  // console.log('find GameCanvas element');
  // gameCanvas.addEventListener('click', function () {
  //   console.log("click canvas");
  // });
  // gameCanvas.style.display = 'none';
} else {
  // console.log("can't find GameCanvas element");
  // 和background.js保持短连接通讯
  chrome.runtime.sendMessage({
    msg: PluginMsg.Msg.Support,
    data: {
      support: false,
      msg: "未发现GameCanvas,不支持调试游戏!"
    }
  }, function (data) {
    // console.log(data)
  });
}
