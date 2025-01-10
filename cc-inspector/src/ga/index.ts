import { GA_Button, GA_EventName, MeasurementBody } from "./type";

const API_SECRET = "_yU7eNTgT4Khe2Jo22Ki_g";
const MEASUREMENT_ID = "G-RW7J0JZ6T5";
const GA_ENDPOINT = "https://www.google-analytics.com/mp/collect";

export class GoogleAnalytics {
  async getOrCreateSessionId() {
    const result = await chrome.storage.local.get("clientId");
    let clientId = result.clientId;
    if (!clientId) {
      clientId = self.crypto.randomUUID();
      await chrome.storage.local.set({ clientId });
    }
    return clientId;
  }
  public async fireEventWithParam(name: GA_EventName, param: string) {
    const time = Date.now();
    const id = await this.getOrCreateSessionId();
    fetch(`${GA_ENDPOINT}?measurement_id=${MEASUREMENT_ID}&api_secret=${API_SECRET}`, {
      method: "POST",
      body: JSON.stringify({
        client_id: id,
        events: [
          {
            name: name,
            params: {
              id: param,
              session_id: time.toString(),
              engagement_time_msec: time.toString(),
            },
          },
        ],
      } as MeasurementBody),
    });
  }
  public async fireEvent(name: string) {
    const time = Date.now();
    const id = await this.getOrCreateSessionId();
    fetch(`${GA_ENDPOINT}?measurement_id=${MEASUREMENT_ID}&api_secret=${API_SECRET}`, {
      method: "POST",
      body: JSON.stringify({
        client_id: id,
        events: [
          {
            name: name,
            params: {
              session_id: time.toString(),
              engagement_time_msec: time.toString(),
            },
          },
        ],
      } as MeasurementBody),
    });
  }
  async clickButton(btn: GA_Button) {
    await this.fireEventWithParam(GA_EventName.ButtonClicked, btn);
  }
  async openView(view: string) {
    await this.fireEventWithParam(GA_EventName.PageView, view);
  }
}
export const ga = new GoogleAnalytics();
