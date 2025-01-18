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
  constructor() {
    const cfg = localStorage.getItem(this.key);
    if (cfg) {
      try {
        const ret = JSON.parse(cfg) as MirrorInfo[];
        if (ret) {
          ret.forEach((el) => {
            this.data.push({ name: el.name, time: el.time });
          });
        }
      } catch {}
    }
  }
  save(name: string, time: number) {
    const ret = this.data.find((el) => el.name === name);
    if (ret) {
      ret.time = time;
    } else {
      this.data.push({ name: name, time: time } as MirrorInfo);
    }
    localStorage.setItem(this.key, JSON.stringify(this.data));
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
  constructor(name: string, cb) {
    this.name = name;
    this.time = cfg.getTime(name);
    this.calcUrl = cb;
  }
  private getUrl(file: string) {
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
      console.log(`req ad: ${url}`);
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
  constructor() {
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
    this.mirrors.sort((a, b) => b.time - a.time);
    for (let i = 0; i < this.mirrors.length; i++) {
      const mirror = this.mirrors[i];
      const data = await mirror.getData(file);
      if (data) {
        const time = new Date().getTime();
        mirror.time = time;
        cfg.save(mirror.name, time);
        return data;
      }
    }
    return null;
  }
}
export const githubMirrorMgr = new GithubMirrorMgr();
