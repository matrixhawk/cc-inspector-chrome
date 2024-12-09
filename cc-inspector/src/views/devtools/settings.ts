const Key = "settings";

export const enum RefreshType {
  Auto = "auto",
  Manual = "manual",
}

interface SettingsData {
  refreshType: string;
  refreshTime: number;
}

let defaultData: SettingsData = {
  refreshTime: 500,
  refreshType: RefreshType.Manual,
}

class Settings {
  public data: SettingsData | null = null;

  constructor() {
    this.init();
  }

  private init() {
    const data = localStorage.getItem(Key)
    if (data) {
      try {
        this.data = JSON.parse(data)
      } catch (e) {
        this.data = defaultData;
      }
    }
    this.data = Object.assign(defaultData, this.data)
  }

  isManualRefresh() {
    return this.data?.refreshType === RefreshType.Manual;
  }

  save() {
    const str = JSON.stringify(this.data);
    localStorage.setItem(Key, str);
  }
}

export const settings = new Settings();
