/* global Hooks game */
import LOGGER from "../utils/cpr-logger.js";
import SystemUtils from "../utils/cpr-systemUtils.js";

/**
 * Hooks have a set of args that are passed to them from Foundry. Even if we do not use them here,
 * we document them all for clarity's sake and to make future development/debugging easier.
 */
const tokenHooks = () => {
  /**
   * The preUpdateToken Hook is provided by Foundry and triggered here. When a token is updated, this hook is called
   * just before. This hook is for container tokens being updated. The GM can set a flag that prevents
   * players from moving the container, and we check that here. If a player tries to move a container they're not
   * allowed to, we emit a warning.
   *
   * @public
   * @memberof hookEvents
   * @param {Token} token           The token object being updated
   * @param {object} data           A trimmed object with the data being updated
   * @param {object} (unused)       Additional options which modify the update request
   * @param {string} (unused)       The ID of the requesting user, always game.user.id
   */
  Hooks.on("preUpdateToken", (token, data) => {
    LOGGER.trace("preUpdateToken | tokenHooks | Called.");
    if (token.actor.type === "container" && !game.user.isGM) {
      // Defined x and/or y properties indicate the token is attempting to move to a new coordinate location.
      // this indicates a moved token, so we check the permissions.
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
