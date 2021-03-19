/* eslint-disable no-undef */
import HudPrompt from "../dialog/cpr-hud-prompt.js";

export default class HudInterface {
  static async SetDvTable(tokenData) {
    const dvPattern = new RegExp("^DV ");
    const dvTables = game.tables.filter((t) => t.data.name.match(dvPattern));
    const formData = await HudPrompt.RenderPrompt("dv", dvTables);
    const { controlled } = canvas.tokens;
    const index = controlled.findIndex((x) => x.data._id === tokenData._id);
    const token = controlled[index];
    return token.update({ "flags.cprDvTable": formData.dvTable });
  }
}
