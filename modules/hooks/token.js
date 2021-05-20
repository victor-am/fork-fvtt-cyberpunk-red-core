/* global Hooks game canvas */
import LOGGER from "../utils/cpr-logger.js";
import Rules from "../utils/cpr-rules.js";
import SystemUtils from "../utils/cpr-systemUtils.js";

const tokenHooks = () => {
  Hooks.on("preUpdateToken", (scene, token, updatedData) => {
    LOGGER.trace("preUpdateToken | tokenHooks | Called.");
    if ("actorData" in updatedData && "data" in updatedData.actorData && "roleInfo" in updatedData.actorData.data) {
      Rules.lawyer(Rules.validRole(game.actors.get(token.actorId), updatedData.actorData), "CPR.invalidroledata");
    }
    if (updatedData.actorData && updatedData.actorData.data && updatedData.actorData.data.externalData) {
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

  // this hook auto-installs cyberware or equips gear when dragging to a mook sheet
  // that belongs to an unlinked token
  // Moo Man claims this can go away with 0.8 because hooks will be more consistent for unlinked tokens
  Hooks.on("updateToken", (scene, tokenData, updateData) => {
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
      } else if (tokenActor.data.type === "mook") {
        if ("items" in updateData.actorData) {
          // this seems like a dangerous assumption... is the new item is always at the end of the array?
          const handledItem = tokenActor.getFlag("cyberpunk-red-core", "handled-item");
          const newItem = updateData.actorData.items[updateData.actorData.items.length - 1];
          if (handledItem !== newItem._id) {
            // calling this fires updateToken a second time, so we use a flag to handle that
            tokenActor.handleMookDraggedItem(newItem);
            tokenActor.setFlag("cyberpunk-red-core", "handled-item", newItem._id);
          }
        }
      }
    }
  });
};

export default tokenHooks;
