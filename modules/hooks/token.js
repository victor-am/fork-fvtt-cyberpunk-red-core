/* global Hooks game canvas */
import LOGGER from "../utils/cpr-logger.js";
import Rules from "../utils/cpr-rules.js";
import SystemUtils from "../utils/cpr-systemUtils.js";
import CPRMookActorSheet from "../actor/sheet/cpr-mook-sheet.js";

const tokenHooks = () => {
  /* // Not needed anymore as with an unlinked token preUpdateActor is also called now.
  Hooks.on("preUpdateToken", (scene, token, updatedData) => {
    LOGGER.trace("preUpdateToken | tokenHooks | Called.");
    if (updatedData.actorData && updatedData.actorData.items) {
      // This following line assumes that the most recently added item is the last in the array,
      // and that the order of actor.items does not get shuffled; may be bad assumption.
      // Necessary in Foundry 0.7 because createEmbeddedEntity is not called when dragging items to unlinked tokens.
      // May become unnecessary in Foundry 0.8 as hooks should be more consistent across linked/unlinked tokens
      // We should revisit then.
      const newItem = updatedData.actorData.items[updatedData.actorData.items.length - 1];
      if (newItem.data.core) {
        SystemUtils.DisplayMessage("warn", "CPR.dontaddcoreitems");
        // If preUpdateToken returns false, no further hooks get called.
        return false;
      }
    }

    if ("actorData" in updatedData && "data" in updatedData.actorData && "roleInfo" in updatedData.actorData.data) {
      Rules.lawyer(Rules.validRole(game.actors.get(token.actorId), updatedData.actorData), "CPR.invalidroledata");
    }

    if (updatedData.actorData && updatedData.actorData.data && updatedData.actorData.data.externalData) {
      Object.entries(updatedData.actorData.data.externalData).forEach(
        ([itemType, itemData]) => {
          if (!updatedData.actorData.data.externalData[itemType].id) {
            const actor = (Object.keys(game.actors.tokens).includes(token._id)) ? game.actors.tokens[token._id] : null;
            if (actor !== null) {
              const itemId = actor.data.data.externalData[itemType].id;
              const item = actor._getOwnedItem(itemId);
              const currentValue = updatedData.actorData.data.externalData[itemType].value;
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
                        updateList.push(armorData);
                      });
                      actor.updateEmbeddedDocuments("Item", updateList);
                    }
                    if (itemType === "currentArmorShield") {
                      item.data.data.shieldHitPoints.value = currentValue;
                      actor.updateEmbeddedDocuments("Item", item.data);
                    }
                    break;
                  }
                  default:
                }
              }
            }
          }
        },
      );
    }
    return true;
  }); */

  // this hook auto-installs cyberware or equips gear when dragging to a mook sheet
  // that belongs to an unlinked token
  // Moo Man claims this can go away with 0.8 because hooks will be more consistent for unlinked tokens
  Hooks.on("updateToken", (scene, tokenData, updateData, diff, userId) => {
    LOGGER.trace("updateToken | tokenHooks | Called.");
    LOGGER.debugObject(tokenData);
    LOGGER.debugObject(updateData);
    if (("actorData" in tokenData) && ("actorData" in updateData)) {
      const tokenActor = canvas.tokens.get(tokenData._id).actor;
      LOGGER.debugObject(tokenActor);
      if (typeof tokenActor === "undefined") {
        // this happens if the scene is changed while the mook sheet is still displayed and dragged to
        const warning = SystemUtils.Localize("CPR.notokenfound");
        SystemUtils.DisplayMessage("error", warning);
      } else if (Object.values(tokenActor.apps).some((app) => app instanceof CPRMookActorSheet) && userId === game.user.data._id) {
        if ("items" in updateData.actorData) {
          // this seems like a dangerous assumption... is the new item is always at the end of the array?
          const handledItem = tokenActor.getFlag("cyberpunk-red-core", "handled-item");
          const newItem = updateData.actorData.items[updateData.actorData.items.length - 1];
          if (handledItem !== newItem.id) {
            // calling this fires updateToken a second time, so we use a flag to handle that
            tokenActor.handleMookDraggedItem(newItem);
            tokenActor.setFlag("cyberpunk-red-core", "handled-item", newItem.id);
          }
        }
      }
    }
  });
};

export default tokenHooks;
