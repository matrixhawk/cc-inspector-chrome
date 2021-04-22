interface ICCInspector extends Object {
  devPageCallEntry(para: string): void;

  init(): void;
}

declare interface Window {
  CCInspector: ICCInspector;
  CCInspectorPara: string;
}
debugger
if (window.hasOwnProperty('CCInspector')) {
  if (window.CCInspector.hasOwnProperty('devPageCallEntry')) {
    window.CCInspector.devPageCallEntry(window.CCInspectorPara);
  } else {
    console.log("脚本inject.js未注入")
  }
}
