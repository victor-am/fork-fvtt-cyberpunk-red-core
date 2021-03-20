/* eslint-disable no-undef */
import HudPrompt from "../dialog/cpr-hud-prompt.js";
import DvUtils from "../utils/cpr-dvUtils.js";

export default class HudInterface {
  static async SetDvTable(tokenData) {
    const dvTables = DvUtils.GetDvTables();
    const formData = await HudPrompt.RenderPrompt("dv", dvTables);
    if (formData.dvTable === null) {
      formData.dvTable = "";
    }
    const { controlled } = canvas.tokens;
    const index = controlled.findIndex((x) => x.data._id === tokenData._id);
    const token = controlled[index];
    return token.update({ "flags.cprDvTable": formData.dvTable });
  }
}
