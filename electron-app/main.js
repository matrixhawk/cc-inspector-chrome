const Path = require("path");
const {BrowserWindow, app} = require("electron");
app.on("ready", () => {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      nodeIntegrationInSubFrames: true,
      nodeIntegrationInWorker: true,
      webSecurity: true,
      contextIsolation: false,
    }
  });
  win.webContents.openDevTools({mode: "right"});
  win.loadFile(Path.join(__dirname, "index.html"));
  win.show();
});
app.on("window-all-closed", () => {
  app.quit();
});
