/* global Hooks */
/* eslint no-unused-vars:1 */
import LOGGER from "../utils/cpr-logger.js";
import Rules from "../utils/cpr-rules.js";

const tokenHooks = () => {
  Hooks.on("preUpdateToken", (scene, token, updateData) => {
    LOGGER.trace("preUpdateToken | tokenHooks | Called.");
    if ("actorData" in updateData && "data" in updateData.actorData && "roleInfo" in updateData.actorData.data) {
      Rules.lawyer(Rules.validRole(game.actors.get(token.actorId), updateData.actorData), "CPR.invalidroledata");
    }
  });
}

export default tokenHooks;