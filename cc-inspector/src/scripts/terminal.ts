export class Terminal {
  /**
   * 标签
   */
  tag = 'terminal';
  /**
   * 标签的颜色
   */
  tagColor = 'red';
  /**
   * 标签的背景色
   */
  tagBackground = 'yellow';
  /**
   * 日志文本的颜色
   */
  txtColor = 'black';

  constructor(tag: string, tagColor: string = 'red', tagBackground: string = 'yellow') {
    this.tagColor = tagColor;
    this.tagBackground = tagBackground;
    this.tag = tag;
  }
  init(): string[] {
    return this.log(`init`);
  }
  public log(message: string, newline: boolean = false): string[] {
    return [`%c${this.tag}%c${newline ? '\n' : ''}${message}`, `color:${this.tagColor};background:${this.tagBackground};padding:0 4px`, `color:${this.txtColor};margin-left:5px`];
  }
  public blue(message: string): string[] {
    this.txtColor = 'blue';
    return this.log(message);
  }
  public green(message: string): string[] {
    this.txtColor = 'green';
    return this.log(message);
  }
  public red(message: string): string[] {
    this.txtColor = 'red';
    return this.log(message);
  }
  message(msg: string): string[] {
    this.txtColor = 'black';
    return this.log(`[message] ${msg}`);
  }
  connect(msg: string): string[] {
    this.txtColor = 'black';
    return this.log(`[connect] ${msg}`);
  }
  disconnect(msg: string): string[] {
    this.txtColor = 'black';
    return this.log(`[disconnect] ${msg}`);
  }
}
