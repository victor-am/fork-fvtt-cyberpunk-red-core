/* global Hooks */
import LOGGER from "../utils/cpr-logger.js";
import Rules from "../utils/cpr-rules.js";

const actorHooks = () => {
  Hooks.on("preCreateActor", (createData) => {
    LOGGER.trace("\"preCreateActor | actorHooks | Called.\"");
    if (!createData.token) {
      // TODO - Token Setup Goes Here
    }
  });

  Hooks.on("preUpdateActor", (actor, updatedData) => {
    LOGGER.trace("preUpdateActor | actorHooks | Called.");
    Rules.lawyer(Rules.validRole(actor, updatedData), "CPR.invalidroledata");
  });

  // when a new item is created (dragged) on a mook sheet, auto install or equip it
  // this does not fire when dragging to an unlinked token's sheet, see token.js for that
  Hooks.on("createOwnedItem", (actor, itemData) => {
    LOGGER.trace("createOwnedItem | actorHooks | Called.");
    if (actor.data.type === "mook") {
      LOGGER.debug("handling a dragged item to the mook sheet");
      actor.handleMookDraggedItem(actor._getOwnedItem(itemData._id));
    }
  });
};

export default actorHooks;
