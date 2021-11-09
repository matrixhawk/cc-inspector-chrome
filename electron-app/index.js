const WS = require("ws");
let Server = null;
new Vue({
  el: "#app",
  data: {
    status: "---",
    recvMsg: "",
    recvMsgError: false,
    sendCode: "console.log('hello')",
    webSocketInstance: null,
  },
  created() {
    Server = new WS.Server({port: 1109});
    Server.on("connection", (webSocket) => {
      this.status = "link";
      this.webSocketInstance = webSocket;
      webSocket.on("message", (msg) => {
        const {error, data} = JSON.parse(msg);
        this.recvMsgError = !!error;
        if (data) {
          this.recvMsg = data;
        } else {
          this.recvMsg = null;
        }
      });
      webSocket.on("close", () => {
        console.log("close");
        this.status = "close";
        this.webSocketInstance = null;
      });
      webSocket.on("open", () => {
        console.log("open");
        this.status = "open";
      });
      webSocket.on("error", () => {
        console.log("error");
        this.status = "error";
        this.webSocketInstance = null;
      });
    });
  },
  mounted() {

  },
  methods: {
    onRunCmd() {
      if (this.webSocketInstance) {
        let str = {
          code: this.sendCode,
        };
        this.webSocketInstance.send(JSON.stringify(str));
      }
    },
  }

});
