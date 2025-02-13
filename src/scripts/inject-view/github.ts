export interface MirrorInfo {
  /**
   * 请求的url
   */
  name: string;
  /**
   * 上次请求成功的时间
   */
  time: number;
}
class Config {
  private key = "cc-inspector-ad-config";
  private data: MirrorInfo[] = [];
  async init() {
    try {
      let str: string = "";
      if (this.isChromeBackgroundEnv()) {
        const ret = await chrome.storage.local.get(this.key);
        if (ret && ret[this.key]) {
          str = ret[this.key] as string;
        }
      } else {
        str = localStorage.getItem(this.key);
      }
      if (str) {
        const ret = JSON.parse(str) as MirrorInfo[];
        if (ret) {
          ret.forEach((el) => {
            this.data.push({ name: el.name, time: el.time });
          });
        }
      }
    } catch {
      debugger;
    }
  }
  private isChromeBackgroundEnv() {
    return typeof chrome !== "undefined" && typeof chrome.storage !== "undefined" && typeof chrome.storage.local !== "undefined";
  }
  async save(name: string, time: number) {
    const ret = this.data.find((el) => el.name === name);
    if (ret) {
      ret.time = time;
    } else {
      this.data.push({ name: name, time: time } as MirrorInfo);
    }
    const saveString = JSON.stringify(this.data);
    if (this.isChromeBackgroundEnv()) {
      await chrome.storage.local.set({ [this.key]: saveString });
    } else {
      localStorage.setItem(this.key, saveString);
    }
  }
  getTime(url: string) {
    const ret = this.data.find((el) => el.name === url);
    if (ret) {
      return ret.time;
    }
    return 0;
  }
}
export class GithubMirror {
  owner: string = "tidys";
  repo: string = "cc-inspector-ad";
  branch: string = "main";
  /**
   * 上次请求成功的时间
   */
  time: number = 0;
  /**
   * 镜像的名字
   */
  name: string = "";
  private calcUrl: Function;
  constructor(name: string, cb: Function) {
    this.name = name;
    this.time = cfg.getTime(name);
    this.calcUrl = cb;
  }
  public getUrl(file: string) {
    if (!file) {
      return "";
    }
    if (this.calcUrl) {
      return this.calcUrl(this.owner, this.repo, this.branch, file);
    } else {
      return "";
    }
  }
  public async getData(file: string) {
    const url = this.getUrl(file);
    if (url) {
      const data = await this.reqFecth(url);
      return data;
    }
    return null;
  }
  private reqFecth(url: string): Promise<Object | null> {
    return new Promise((resolve, reject) => {
      // console.log(`req ad: ${url}`);
      fetch(url)
        .then((res) => {
          return res.json();
        })
        .then((data) => {
          resolve(data);
        })
        .catch((e) => {
          resolve(null);
        });
    });
  }
}
const cfg = new Config();
export class GithubMirrorMgr {
  mirrors: GithubMirror[] = [];
  private _init: boolean = false;
  async init() {
    if (this._init) {
      return;
    }
    await cfg.init();
    this._init = true;
    // 使用国内gitub镜像来达到下载远程配置文件的目的
    this.mirrors.push(
      new GithubMirror("github", (owner: string, repo: string, branch: string, file: string) => {
        return `https://raw.githubusercontent.com/${owner}/${repo}/refs/heads/${branch}/${file}`;
      })
    );
    this.mirrors.push(
      new GithubMirror("bgithub", (owner: string, repo: string, branch: string, file: string) => {
        return `https://raw.bgithub.xyz/${owner}/${repo}/refs/heads/${branch}/${file}`;
      })
    );
    this.mirrors.push(
      new GithubMirror("kkgithub", (owner: string, repo: string, branch: string, file: string) => {
        return `https://raw.kkgithub.com/${owner}/${repo}/refs/heads/${branch}/${file}`;
      })
    );

    this.mirrors.push(
      new GithubMirror("xiaohei", (owner: string, repo: string, branch: string, file: string) => {
        return `https://raw-githubusercontent.xiaohei.me/${owner}/${repo}/refs/heads/${branch}/${file}`;
      })
    );

    this.mirrors.push(
      new GithubMirror("gh-proxy", (owner: string, repo: string, branch: string, file: string) => {
        return `https://gh-proxy.com/raw.githubusercontent.com/${owner}/${repo}/refs/heads/${branch}/${file}`;
      })
    );
    this.mirrors.push(
      new GithubMirror("ghproxy", (owner: string, repo: string, branch: string, file: string) => {
        return `https://ghproxy.net/https://raw.githubusercontent.com/${owner}/${repo}/refs/heads/${branch}/${file}`;
      })
    );
  }
  async getData(file: string): Promise<Object | null> {
    if (!this._init) {
      return null;
    }
    this.mirrors.sort((a, b) => b.time - a.time);
    for (let i = 0; i < this.mirrors.length; i++) {
      const mirror = this.mirrors[i];
      const data = await mirror.getData(file);
      if (data) {
        const time = new Date().getTime();
        mirror.time = time;
        await cfg.save(mirror.name, time);
        return data;
      }
    }
    return null;
  }
  getFileUrl(file: string): string {
    if (!this._init) {
      debugger;
      return null;
    }
    if (!file) {
      return "";
    }
    this.mirrors.sort((a, b) => b.time - a.time);
    const url = this.mirrors[0].getUrl(file);
    return url;
  }
}
export const githubMirrorMgr = new GithubMirrorMgr();
