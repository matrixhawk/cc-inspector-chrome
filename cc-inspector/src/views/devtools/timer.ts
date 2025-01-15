export class Timer {
  private timer: number | null = null;
  private callback: Function | null = null;
  private duration: number = 0;
  public name: string = "";
  constructor(cb: Function = null, duration: number = 300) {
    this.callback = cb;
    this.duration = duration;
  }
  create(rightNow: boolean = false) {
    this.clean();
    this.timer = setInterval(this.callback, this.duration);
    if (rightNow) {
      this.callback && this.callback();
    }
  }
  clean() {
    if (this.timer === null) {
      return;
    }
    clearInterval(this.timer);
    this.timer = null;
  }
}
