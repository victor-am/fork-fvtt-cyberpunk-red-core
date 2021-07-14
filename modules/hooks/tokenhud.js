/* eslint-disable no-undef */
/* global Hooks */
/* eslint no-unused-vars:1 */
import LOGGER from "../utils/cpr-logger.js";
import HudInterface from "../hud/interface.js";

const tokenHudHooks = () => {
  Hooks.on("renderTokenHUD", async (hud, html, token) => {
    LOGGER.trace("renderTokenHUD | tokenHudHooks | Called.");
    // Configure DV Ruler
    const dvHudTemplate = "systems/cyberpunk-red-core/templates/hud/dv.hbs";
    const dvDisplay = await renderTemplate(dvHudTemplate, token.flags);
    html.find("div.left").append(dvDisplay);
    html.find(".dv-table-selector").click(() => {
      HudInterface.SetDvTable(token);
      hud.clear();
    });
    // Any other HUD code
  });
};

export default tokenHudHooks;
