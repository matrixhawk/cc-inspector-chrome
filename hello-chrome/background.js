console.log("background.js")
chrome.runtime.onConnect.addListener((port) => {
  console.log("runtime onConnect: ", port)
  port.onMessage.addListener((message) => {
    console.log("runtime port onMessage: ", message)
    port.postMessage(message + "*bg")
  })
  port.onDisconnect.addListener(() => {
    console.log("runtime port onDisconnect")
  })
})
chrome.runtime.onMessage.addListener((message) => {
  console.log("runtime onMessage: ", message)
})

chrome.debugger.onEvent.addListener((source, method, params) => {
  // console.log("debugger onEvent: ", source, method, params)
})
chrome.action.onClicked.addListener((tab) => {
  debugger
  // 使用devtools协议链接到页面
  chrome.debugger.attach({ tabId: tab.id }, "1.0", () => {
    chrome.debugger.sendCommand({ tabId: tab.id }, "Debugger.enable", {}, () => { });
    return;
    debugger;
    // 启动调试器
    chrome.debugger.sendCommand({ tabId: tab.id }, "Debugger.enable", {}, () => {
      debugger;
      // chrome.debugger.sendCommand({ tabId: tab.id }, "Debugger.getScriptSource", (scripts) => {
      //   console.log(scripts);
      //   debugger
      // })
      chrome.debugger.sendCommand(
        { tabId: tab.id, },
        "Runtime.evaluate",
        { expression: "window.abc=()=>{console.log(1)}" },
        (result) => {
          debugger
          if (result && result.result && result.result.objectId) {
            console.log(result.result);

            chrome.debugger.sendCommand(
              {
                tabId: tab.id,
                method: "Debugger.searchInContentScripts",
                params: {
                  query: "abc",
                }
              }, (result) => {
                debugger
              })
            return;
            // 获取func
            chrome.debugger.sendCommand(
              {
                tabId: tab.id,
                method: "Debugger.searchInContentScripts",
                params: {
                  query: "window.abc",
                }
              },
              "Debugger.searchInContentScripts",
              { functionId: result.result.objectId },
              (location) => {
                debugger
                console.log(location);
                if (location) {
                  // 调整到函数
                  chrome.debugger.sendCommand(
                    { tabId: tab.id, },
                    "Debugger.setBreakpoint",
                    {
                      location: location.locations[0],
                    },
                    (brk) => {
                      debugger
                      console.log(brk);
                    }
                  )

                }

              }
            )
          }
        }
      );


    });


  });
})
// chrome.tabs.onConnect.addListener((port) => {
//   console.log("tabs onConnect: ", port)
//   port.onMessage.addListener((message) => {
//     console.log("port onMessage: ", message)
//   })
//   port.onDisconnect.addListener(() => {
//     console.log("port onDisconnect")
//   })
// })
// chrome.tabs.onMessage.addListener((message) => {
//   console.log("tabs onMessage: ", message)
// })