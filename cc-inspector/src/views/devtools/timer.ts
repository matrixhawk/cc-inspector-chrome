export class Timer {
  private timer: number | null = null;
  /**
   * 执行定时器的回调
   */
  public onWork: Function | null = null;
  /**
   * 清理定时器的回调
   */
  public onClean: Function | null = null;
  public duration: number = 300;
  public name: string = "";

  create(rightNow: boolean = false) {
    this.clean();
    this.timer = setInterval(this.onWork, this.duration);
    if (rightNow) {
      this.onWork && this.onWork();
    }
  }
  clean() {
    if (this.timer === null) {
      return;
    }
    clearInterval(this.timer);
    this.timer = null;
    this.onClean && this.onClean();
  }
}
