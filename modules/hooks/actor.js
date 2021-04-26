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

  Hooks.on("createOwnedItem", (actor, itemData) => {
    if (actor.data.type === "mook") {
      actor.handleMookDraggedItem(actor, actor._getOwnedItem(itemData._id));
    }
  });
};

export default actorHooks;
