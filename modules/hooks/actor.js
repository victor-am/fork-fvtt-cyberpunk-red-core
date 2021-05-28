/* global Hooks */
import LOGGER from "../utils/cpr-logger.js";
import Rules from "../utils/cpr-rules.js";
import CPRMookActorSheet from "../actor/sheet/cpr-mook-sheet.js";

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
                    const armorList = actor.getEquippedArmors("body");
                    const updateList = [];
                    const diff = item.data.data.bodyLocation.sp - item.data.data.bodyLocation.ablation - currentValue;
                    armorList.forEach((a) => {
                      const armorData = a.data;
                      if (diff > 0) {
                        armorData.data.bodyLocation.ablation = Math.min(armorData.data.bodyLocation.ablation + diff, armorData.data.bodyLocation.sp);
                      }
                      if (diff < 0 && item.data._id === a.data._id) {
                        armorData.data.bodyLocation.ablation = Math.max(armorData.data.bodyLocation.ablation + diff, 0);
                      }
                      updateList.push(armorData);
                    });
                    actor.updateEmbeddedEntity("OwnedItem", updateList);
                  }
                  if (itemType === "currentArmorHead") {
                    const armorList = actor.getEquippedArmors("head");
                    const updateList = [];
                    const diff = item.data.data.headLocation.sp - item.data.data.headLocation.ablation - currentValue;
                    armorList.forEach((a) => {
                      const armorData = a.data;
                      if (diff > 0) {
                        armorData.data.headLocation.ablation = Math.min(armorData.data.headLocation.ablation + diff, armorData.data.headLocation.sp);
                      }
                      if (diff < 0 && item.data._id === a.data._id) {
                        armorData.data.headLocation.ablation = Math.max(armorData.data.headLocation.ablation + diff, 0);
                      }
                      updateList.push(armorData);
                    });
                    actor.updateEmbeddedEntity("OwnedItem", updateList);
                  }
                  if (itemType === "currentArmorShield") {
                    item.data.data.shieldHitPoints.value = currentValue;
                    actor.updateEmbeddedEntity("OwnedItem", item.data);
                  }
                  break;
                }
                default:
              }
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
    if (Object.values(actor.apps).some((app) => app instanceof CPRMookActorSheet)) {
      LOGGER.debug("handling a dragged item to the mook sheet");
      actor.handleMookDraggedItem(actor._getOwnedItem(itemData._id));
    }
  });
};

export default actorHooks;
