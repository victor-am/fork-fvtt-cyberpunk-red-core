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

  // Updates the armor item when external data for armor is updated from the tokenHUD.
  Hooks.on("preUpdateActor", (actor, updatedData) => {
    LOGGER.trace("preUpdateActor | actorHooks | Called.");
    Rules.lawyer(Rules.validRole(actor, updatedData), "CPR.invalidroledata");
    if (updatedData.data && updatedData.data.externalData) {
      Object.entries(updatedData.data.externalData).forEach(
        ([itemType, itemData]) => {
          if (!updatedData.data.externalData[itemType].id) {
            const itemId = actor.data.data.externalData[itemType].id;
            const item = actor._getOwnedItem(itemId);
            const currentValue = updatedData.data.externalData[itemType].value;
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
        },
      );
    }
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
