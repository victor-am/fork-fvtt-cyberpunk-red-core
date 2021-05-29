/* global Hooks game */
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
    if (actor.data.type !== "blackIce") {
      Rules.lawyer(Rules.validRole(actor, updatedData), "CPR.invalidroledata");
    }

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
                      updateList.push({ _id: a.id, data: armorData.data });
                    });
                    actor.updateEmbeddedDocuments("Item", updateList);
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
                      updateList.push({ _id: a.id, data: armorData.data });
                    });
                    actor.updateEmbeddedDocuments("Item", updateList);
                  }
                  if (itemType === "currentArmorShield") {
                    item.data.data.shieldHitPoints.value = currentValue;
                    actor.updateEmbeddedDocuments("Item", [{ _id: item.id, data: item.data.data }]);
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
  Hooks.on("createItem", (itemData, options, userId) => {
    LOGGER.trace("createOwnedItem | actorHooks | Called.");
    const actor = itemData.parent;
    if (actor !== null) {
      if (Object.values(actor.apps).some((app) => app instanceof CPRMookActorSheet) && userId === game.user.data._id) {
        LOGGER.debug("handling a dragged item to the mook sheet");
        actor.handleMookDraggedItem(actor._getOwnedItem(itemData.id));
      }
    }
  });
};

export default actorHooks;
