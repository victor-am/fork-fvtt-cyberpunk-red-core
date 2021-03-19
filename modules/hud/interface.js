import HudPrompt from "../dialog/cpr-hud-prompt.js";

export default class HudInterface {
  static async SetDvTable(tokenData) {
    const dvPattern = new RegExp("^DV ");
    const dvTables = game.tables.filter((t) => {
      const name = t.data.description;
      return t.data.name.match(dvPattern);
    });
    let formData = await HudPrompt.RenderPrompt("dv", dvTables);
    const controlled = canvas.tokens.controlled
    const index = controlled.findIndex(x => x.data._id === tokenData._id);
    const token = controlled[index];
    console.log(formData);
    console.log(token);
    return token.update({ "flags.cprDvTable": formData.dvTable });
  };
}