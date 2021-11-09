// 游戏的inspect脚本
const host = "192.168.1.5";//"localhost";
const port = 1109;
let url = `ws://${host}:${port}`;
const ws = new WebSocket(url);
ws.onopen = () => {
  console.log("成功链接调试服务器", url);
};
ws.onmessage = (event) => {
  console.log("收到消息", event);
  const {code} = JSON.parse(event.data);
  if (code) {
    let ret = null;
    let error = false;
    try {
      ret = eval(`${code}`);
    } catch (e) {
      error = true;
      ret = e.toString();
    }
    ws.send(JSON.stringify({
      error,
      data: ret,
    }));
  }
};
ws.onerror = () => {
  console.log("error");
};
ws.onclose = () => {
  console.log("close");
};
