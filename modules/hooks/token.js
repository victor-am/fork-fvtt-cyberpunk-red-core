/* eslint-disable no-unused-vars */
/* global Hooks game */
/* eslint no-unused-vars:1 */
import LOGGER from "../utils/cpr-logger.js";
import SystemUtils from "../utils/cpr-systemUtils.js";

const tokenHooks = () => {
  Hooks.on("preUpdateToken", (token, data, options, userId) => {
    LOGGER.trace("preUpdateToken | tokenHooks | Called.");
    if (token.actor.type === "container" && !game.user.isGM) {
      if (typeof data.x !== "undefined" || typeof data.y !== "undefined") {
        if (typeof token.actor.getFlag("cyberpunk-red-core", "players-move") === "undefined") {
          SystemUtils.DisplayMessage("warn", SystemUtils.Localize("CPR.messages.insufficientPermissions"));
          return false;
        }
      }
    }
    return true;
  });
};

export default tokenHooks;
