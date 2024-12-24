export class Terminal {
  color = 'red';
  background = 'yellow';
  tag = 'terminal';
  constructor(tag: string, color: string = 'red', background: string = 'yellow') {
    this.color = color;
    this.background = background;
    this.tag = tag;
  }
  init(): string[] {
    return this.log(`init`);
  }
  public log(message: string, newline: boolean = false): string[] {
    return [`%c${this.tag}%c${newline ? '\n' : ''}${message}`, `color:${this.color};background:${this.background};padding:0 4px`, "color:black;margin-left:5px"];
  }


  public blue(message: string): string[] {
    this.color = 'blue';
    return this.log(message);
  }
  public green(message: string): string[] {
    this.color = 'green';
    return this.log(message);
  }
  public red(message: string): string[] {
    this.color = 'red';
    return this.log(message);
  }
  connect(msg: string): string[] {
    return this.log(`[connect] ${msg}`);
  }
  disconnect(msg: string): string[] {
    return this.log(`[disconnect] ${msg}`);
  }
}
