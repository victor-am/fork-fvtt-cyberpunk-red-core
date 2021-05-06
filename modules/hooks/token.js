/* global Hooks game */
import LOGGER from "../utils/cpr-logger.js";
import Rules from "../utils/cpr-rules.js";

const tokenHooks = () => {
  Hooks.on("preUpdateToken", (scene, token, updateData) => {
    LOGGER.trace("preUpdateToken | tokenHooks | Called.");
    if ("actorData" in updateData && "data" in updateData.actorData && "roleInfo" in updateData.actorData.data) {
      Rules.lawyer(Rules.validRole(game.actors.get(token.actorId), updateData.actorData), "CPR.invalidroledata");
    }
  });

  // this hook auto-installs cyberware or equips gear when dragging to a mook sheet
  // that belongs to an unlinked token
  Hooks.on("updateToken", (scene, tokenData, updateData) => {
    LOGGER.trace("updateToken | tokenHooks | Called.");
    LOGGER.debugObject(tokenData);
    LOGGER.debugObject(updateData);
    if (("actorData" in tokenData) && ("actorData" in updateData)) {
      const actor = game.actors.find((a) => a._id === tokenData.actorId);
      if (actor.data.type === "mook") {
        // this seems like a dangerous assumption... the new item is always at the end of the array
        const newItem = updateData.actorData.items[updateData.actorData.items.length - 1];
        // somehow call the equivalent of actor.handleMookDraggedItem() here
      }
    }
  });
};

export default tokenHooks;
