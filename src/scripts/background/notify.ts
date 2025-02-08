import PKG from "../../../cc-plugin.config";
import { ga } from "../../ga";
import { GA_EventName } from "../../ga/type";
(async () => {
  interface ConfigItem {
    id: string;
    click?: Function;
    closed?: Function;
    title: string;
    message: string;
    /**
     * 距离安装时间多久才会弹出来，单位秒
     */
    afterInstall: number;
    /**
     * 距离上次弹出来多久才会弹出来，单位秒
     */
    afterLatestShow: number;
    buttons?: Array<{ title: string; click?: Function }>;
  }
  function goRate() {
    const url = PKG.manifest.chrome.url;
    if (url) {
      // chrome.windows.create({
      //   url: url,
      //   type: "normal",
      // });
      chrome.tabs.create({ url: url });
      ga.fireEventWithParam(GA_EventName.Rate, "go");
    }
  }
  const config: ConfigItem[] = [
    {
      id: "rate",
      title: "Hi",
      message: "如果不是真爱，你也不会使用这么长时间，求五星好评！",
      afterInstall: 60 * 60 * 24 * 3, // 安装3天后
      afterLatestShow: 60 * 60 * 24 * 1, // 一天一次
      click: () => {
        goRate();
      },
      closed: () => {
        console.log("closed");
      },
      buttons: [
        {
          title: "我已评价",
          click: () => {
            chrome.storage.local.set({ [HasRate]: true });
            ga.fireEventWithParam(GA_EventName.Rate, "has rate");
          },
        },
        {
          title: "前往评价",
          click: () => {
            goRate();
          },
        },
      ],
    },
  ];

  chrome.notifications.onClicked.addListener((id) => {
    const ret = config.find((el) => el.id === id);
    if (ret) {
      ret.click && ret.click();
    }
  });
  chrome.notifications.onClosed.addListener((id) => {
    const ret = config.find((el) => el.id === id);
    if (ret) {
      ret.closed && ret.closed();
    }
  });
  chrome.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
    const ret = config.find((el) => el.id === notificationId);
    if (!ret.buttons) {
      return;
    }
    const btn = ret.buttons[buttonIndex];
    if (!btn) {
      return;
    }
    btn.click && btn.click();
  });
  const InstallTime = "install-time";
  const LatestShowTime = "latest-show-time";
  const HasRate = "has-rate";

  let res = await chrome.storage.local.get(InstallTime);
  const time = res[InstallTime];
  if (!time) {
    // 首次安装
    chrome.storage.local.set({ [InstallTime]: new Date().getTime() });
    return;
  }
  const diff = (new Date().getTime() - time) / 1000;
  for (let i = 0; i < config.length; i++) {
    const { title, afterInstall, buttons, message, id } = config[i];
    if (diff > afterInstall) {
      await createNotification(config[i]);
    }
  }

  async function createNotification(config: ConfigItem) {
    let canShow = false;
    const res = await chrome.storage.local.get(LatestShowTime);
    const time = res[LatestShowTime];
    if (time) {
      const diff = (new Date().getTime() - time) / 1000;
      canShow = diff > config.afterLatestShow;
    } else {
      // 首次弹出
      canShow = true;
    }
    if (!canShow) {
      return;
    }
    const result = await chrome.storage.local.get(HasRate);
    if (result[HasRate]) {
      return;
    }

    chrome.storage.local.set({ [LatestShowTime]: new Date().getTime() });
    const { title, afterInstall, buttons, message, id } = config;
    chrome.notifications.create(
      id,
      {
        type: "basic",
        iconUrl: "icons/48.png",
        title: title,
        message: message,
        buttons: buttons ? buttons.map((el) => ({ title: el.title })) : [],
      },
      (id: string) => {}
    );
  }
})();
