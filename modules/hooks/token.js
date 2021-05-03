/* eslint-disable no-undef */
/* global Hooks */
/* eslint no-unused-vars:1 */
import LOGGER from "../utils/cpr-logger.js";
import Rules from "../utils/cpr-rules.js";

const tokenHooks = () => {
  Hooks.on("preUpdateToken", (scene, token, updatedData) => {
    LOGGER.trace("preUpdateToken | tokenHooks | Called.");
    if ("actorData" in updatedData && "data" in updatedData.actorData && "roleInfo" in updatedData.actorData.data) {
      Rules.lawyer(Rules.validRole(game.actors.get(token.actorId), updatedData.actorData), "CPR.invalidroledata");
    }
    if (updatedData.actorData.data && updatedData.actorData.data.externalData) {
      Object.entries(updatedData.actorData.data.externalData).forEach(
        ([itemType, itemData]) => {
          if (!updatedData.actorData.data.externalData[itemType].id) {
            console.log(itemType, itemData);
            const actor = (Object.keys(game.actors.tokens).includes(token._id)) ? game.actors.tokens[token._id] : null;
            if (actor !== null) {
              const itemId = actor.data.data.externalData[itemType].id;
              const item = actor._getOwnedItem(itemId);
              const currentValue = updatedData.actorData.data.externalData[itemType].value;
              if (item) {
                switch (item.data.type) {
                  case "armor": {
                    if (itemType === "currentArmorBody") {
                      item.data.data.bodyLocation.ablation = item.data.data.bodyLocation.sp - currentValue;
                    }
                    if (itemType === "currentArmorHead") {
                      item.data.data.headLocation.ablation = item.data.data.headLocation.sp - currentValue;
                    }
                    if (itemType === "currentArmorShield") {
                      item.data.data.shieldHitPoints.value = currentValue;
                    }
                    break;
                  }
                  default:
                }
                actor.updateEmbeddedEntity("OwnedItem", item.data);
              }
            }
          }
        },
      );
    }
  });
};

export default tokenHooks;
