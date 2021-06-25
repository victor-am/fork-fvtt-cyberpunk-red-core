/* eslint-disable no-undef */
import HudPrompt from "../dialog/cpr-hud-prompt.js";
import DvUtils from "../utils/cpr-dvUtils.js";
import LOGGER from "../utils/cpr-logger.js";

export default class HudInterface {
  static async SetDvTable(tokenData) {
    const dvTables = DvUtils.GetDvTables();
    const formData = await HudPrompt.RenderPrompt("dv", dvTables).catch((err) => LOGGER.debug(err));
    if (formData === undefined) {
      return;
    }
    if (formData.dvTable === null) {
      formData.dvTable = "";
    }
    const { controlled } = canvas.tokens;
    const index = controlled.findIndex((x) => x.data._id === tokenData._id);
    const token = controlled[index];
    token.document.update({ "flags.cprDvTable": formData.dvTable });
  }
}
