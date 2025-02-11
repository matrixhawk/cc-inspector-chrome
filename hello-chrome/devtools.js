console.log("devtools.js");

// const tabsConnect = chrome.tabs.connect({ name: "devtoos" });
// tabsConnect.onMessage.addListener((message) => {
//   console.log("tabsConnect Message: ", message)
// })
// tabsConnect.onDisconnect.addListener(() => {
//   console.log("tabsConnect disconnect")
// })
const runtimeConnect = chrome.runtime.connect({ name: "devtools" })
runtimeConnect.onDisconnect.addListener(() => {
  console.log(`runtimeConnect disconnect`,)
});
runtimeConnect.onMessage.addListener((message) => {
  console.log('runtimeConnect Message: ', message)
  text.innerText = message;
});
// view
const text = document.getElementById('text')
const send2bg = document.getElementById('send2bg')
if (send2bg) {
  send2bg.addEventListener('click', () => {
    console.log(document.flag);
    const message = ("devtools send to background")
    runtimeConnect.postMessage(message)
    // tabsConnect.sendMessage(message);
    // chrome.runtime.sendMessage(message);
  })
}

console.log('href: ', window.location.href);
console.log(chrome.devtools);
console.log(chrome.devtools.inspectedWindow.tabId);
chrome.devtools.panels.setOpenResourceHandler((res) => {
  debugger;
  console.log(res);
})
chrome.devtools.panels.create("Hello World", "icon.png", "devtools.html", (panel) => {
  console.log("panel created");
  panel.onShown.addListener((win, b) => {
    console.log("panel shown", win, b);
    console.log(win.document.body)
    console.log(` doc: `, win.document === document);
    console.log(win.document);
    console.log(window.document);
    win.document.flag = "devtools_panel";
    win.document.body.addEventListener('contextmenu', (e) => {
      console.log(e);
    })
    document.body.addEventListener('keydown', (e) => {
      console.log(e);
    })
  });
  // panel.createStatusBarButton({})
  // panel.show();

  panel.onHidden.addListener((a, b) => {
    console.log("panel hidden", a, b);
    // setTimeout(() => {
    //   debugger;

    //   panel.show();
    // }, 3 * 1000);
  });
  panel.onSearch.addListener((query) => {
    console.log("panel search", query);
  });
});