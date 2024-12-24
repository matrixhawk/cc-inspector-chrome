export class Terminal {
  /**
   * 标签
   */
  tag = 'terminal';
  /**
   * 子标签
   */
  subTag = "";
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
    this.txtColor = 'black';
    this.subTag = "init";
    return this.log(``);
  }
  public log(message: string, newline: boolean = false): string[] {
    return [
      `*%c${this.tag}%c${this.subTag}%c${newline ? '\n' : ''}${message}`,
      `color:${this.tagColor};background:${this.tagBackground};padding:0 4px`,
      `color:white;background:black;padding:0 3px`,
      `color:${this.txtColor};background:#e6e6e6;margin-left:5px`
    ];
  }
  public blue(message: string): string[] {
    this.txtColor = 'blue';
    this.subTag = "";
    return this.log(message);
  }
  public green(message: string): string[] {
    this.txtColor = 'green';
    this.subTag = "";
    return this.log(message);
  }
  public red(message: string): string[] {
    this.txtColor = 'red';
    this.subTag = "";
    return this.log(message);
  }
  message(msg: string): string[] {
    this.txtColor = 'black';
    this.subTag = 'message';
    return this.log(`${msg}`);
  }
  connect(msg: string): string[] {
    this.txtColor = 'black';
    this.subTag = 'connect';
    return this.log(`${msg}`);
  }
  disconnect(msg: string): string[] {
    this.txtColor = 'black';
    this.subTag = 'disconnect';
    return this.log(`${msg}`);
  }
}
