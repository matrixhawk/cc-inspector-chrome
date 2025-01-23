export class Memory {
  public time: number = 0;
  public jsHeapSizeLimit: number = 0;
  public totalJSHeapSize: number = 0;
  public usedJSHeapSize: number = 0;
  constructor() {
    this.update();
  }
  update() {
    const memory = window.performance["memory"];
    if (memory) {
      this.time = Date.now();
      this.jsHeapSizeLimit = memory.jsHeapSizeLimit;
      this.totalJSHeapSize = memory.totalJSHeapSize;
      this.usedJSHeapSize = memory.usedJSHeapSize;
    }
  }
}

export class MemoryDraw {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private width: number = 0;
  private height: number = 0;
  private memoryHistory: Memory[] = [];
  init(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.width = canvas.width;
    this.height = canvas.height;
    this.clearBg();
    this.initTimer();
  }
  private initTimer() {
    setInterval(() => {
      const m = new Memory();
      this.memoryHistory.push(m);
      this.update();
    }, 300);
  }
  private update() {
    this.clearBg();
    for (let i = 0; i < this.memoryHistory.length; i++) {
      const m = this.memoryHistory[i];
      this.drawLine(i);
    }
  }
  private clearBg() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    this.ctx.fillRect(0, 0, this.width, this.height);
  }
  private lineWidth = 10;
  private drawLine(i: number) {
    this.ctx.fillStyle = "rgba(255, 37, 37, 0.5)";
    this.ctx.fillRect(0, 0, i * this.lineWidth, this.height / 2);
  }
}
