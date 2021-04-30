/* global Hooks */
/* eslint no-unused-vars:1 */
import LOGGER from "../utils/cpr-logger.js";
import Rules from "../utils/cpr-rules.js";

const actorHooks = () => {
  Hooks.on("preCreateActor", (createData) => {
    LOGGER.trace("\"preCreateActor | actorHooks | Called.\"");
    if (!createData.token) {
      // TODO - Token Setup Goes Here
    }
  });

  // Updates the armor item when external data for armor is updated from the tokenHUD.
  Hooks.on("preUpdateActor", (actor, updatedData) => {
    LOGGER.trace("preUpdateActor | actorHooks | Called.");
    Rules.lawyer(Rules.validRole(actor, updatedData), "CPR.invalidroledata");
    if (updatedData.data.externalData) {
      Object.entries(updatedData.data.externalData).forEach(
        ([itemType, itemData]) => {
          console.log(itemType, itemData);
          const itemId = actor.data.data.externalData[itemType].id;
          const item = actor._getOwnedItem(itemId);
          const currentValue = updatedData.data.externalData[itemType].value;
          if (item) {
            switch (item.data.type) {
              case "armor": {
                item.data.data.bodyLocation.ablation = item.data.data.bodyLocation.sp - currentValue;
                break;
              }
              default:
            }
            actor.updateEmbeddedEntity("OwnedItem", item.data);
          }
        },
      );
    }
  });
};

export default actorHooks;
