export class Terminal {
  color = 'red';
  background = 'yellow';
  tag = 'terminal';
  constructor(tag: string, color: string = 'red', background: string = 'yellow') {
    this.color = color;
    this.background = background;
    this.tag = tag;
  }
  ok() {
    this.log(`ok`);
  }
  log(message: string) {
    console.log(`%c${this.tag}%c${message}`, `color:${this.color};background:${this.background};padding:0 4px`, "color:black;margin-left:5px")
  }
  connect(msg: string) {
    this.log(`[connect] ${msg}`);
  }
}
