/* eslint-disable no-unused-vars */
/* global Hooks game */
import LOGGER from "../utils/cpr-logger.js";
import Rules from "../utils/cpr-rules.js";
import CPRCharacterActorSheet from "../actor/sheet/cpr-character-sheet.js";
import CPRContainerActorSheet from "../actor/sheet/cpr-container-sheet.js";
import CPRMookActorSheet from "../actor/sheet/cpr-mook-sheet.js";
import SystemUtils from "../utils/cpr-systemUtils.js";

const actorHooks = () => {
  /**
   * preCreateActor Hook is provided by Foundry and triggered here. When an Actor is created, this hook is called just
   * prior to creation.
   *
   * Hooks have a set of args that are passed to them from Foundry so in order to ensure that nothing is lost as part
   * of that call, all args are defined as part of the hook definition.
   *
   * @public
   * @memberof hookEvents
   * @param {Document} doc          The pending Actor document which is requested for creation
   * @param {object} createData     The initial data object provided to the document creation request
   * @param {object} options        Additional options which modify the creation request
   * @param {string} userId         The ID of the requesting user, always game.user.id
   * @return {boolean|void}         Explicitly return false to prevent creation of this Document
   */
  Hooks.on("preCreateActor", (doc, createData, options, userId) => {
    LOGGER.trace("preCreateActor | actorHooks | Called.");
    if (!createData.token) {
      // TODO - Token Setup Goes Here
    }

    if ((typeof createData.img === "undefined")) {
      const actorImage = SystemUtils.GetDefaultImage("Actor", createData.type);
      doc.data.update({ img: actorImage });
    }
  });

  /**
   * preUpdateActor Hook is provided by Foundry and triggered here. When an Actor is updated, this hook is called just
   * prior to update.
   *
   * Hooks have a set of args that are passed to them from Foundry so in order to ensure that nothing is lost as part
   * of that call, all args are defined as part of the hook definition.
   *
   * @public
   * @memberof hookEvents
   * @param {CPRCharacterActor} actor     The pending document which is requested for creation
   * @param {object} updatedData          The changed data object provided to the document creation request
   * @param {object} options              Additional options which modify the creation request
   * @param {string} userId               The ID of the requesting user, always game.user.id
   * @return {boolean|void}               Explicitly return false to prevent creation of this Document
   */
  Hooks.on("preUpdateActor", (actor, updatedData, options, userId) => {
    LOGGER.trace("preUpdateActor | actorHooks | Called.");
    const isCSheet = Object.values(actor.apps).some((app) => app instanceof CPRCharacterActorSheet);
    if (isCSheet && userId === game.user.data._id && actor.type === "character") {
      Rules.lawyer(Rules.validRole(actor, updatedData), "CPR.messages.invalidRoleData");
    }

    // Updates the armor item when external data for armor is updated from the tokenHUD
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
                        armorData.data.bodyLocation.ablation = Math.min(
                          armorData.data.bodyLocation.ablation + diff, armorData.data.bodyLocation.sp,
                        );
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
                        armorData.data.headLocation.ablation = Math.min(
                          armorData.data.headLocation.ablation + diff, armorData.data.headLocation.sp,
                        );
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

    if (actor.type === "blackIce" && actor.isToken && updatedData.data && updatedData.data.stats) {
      const biToken = actor.token;

      const netrunnerTokenId = biToken.getFlag("cyberpunk-red-core", "netrunnerTokenId");
      const cyberdeckId = biToken.getFlag("cyberpunk-red-core", "sourceCyberdeckId");
      const programId = biToken.getFlag("cyberpunk-red-core", "programId");
      const sceneId = biToken.getFlag("cyberpunk-red-core", "sceneId");
      const sceneList = game.scenes.filter((s) => s.id === sceneId);
      if (sceneList.length === 1) {
        const scene = sceneList[0];
        const tokenList = scene.tokens.filter((t) => t.id === netrunnerTokenId);
        if (tokenList.length === 1) {
          const netrunnerToken = tokenList[0];
          const netrunner = netrunnerToken.actor;
          const cyberdeck = netrunner._getOwnedItem(cyberdeckId);
          cyberdeck.updateRezzedProgram(programId, updatedData.data.stats);
          netrunner.updateEmbeddedDocuments("Item", [{ _id: cyberdeck.id, data: cyberdeck.data.data }]);
        }
      }
    }
  });

  /**
   * createItem Hook is provided by Foundry and triggered here. When an Item is created, this hook is called during
   * creation.
   *
   * Hooks have a set of args that are passed to them from Foundry so in order to ensure that nothing is lost as part
   * of that call, all args are defined as part of the hook definition.
   *
   * @public
   * @memberof hookEvents
   * @param {CPRItem} itemData            The pending document which is requested for creation
   * @param {object} options              Additional options which modify the creation request
   * @param {string} userId               The ID of the requesting user, always game.user.id
   */
  Hooks.on("createItem", (itemData, options, userId) => {
    LOGGER.trace("createItem | actorHooks | Called.");
    // when a new item is created (dragged) on a mook sheet, auto install or equip it
    const actor = itemData.parent;
    if (actor !== null) {
      if (Object.values(actor.apps).some((app) => app instanceof CPRMookActorSheet) && userId === game.user.data._id) {
        LOGGER.debug("handling a dragged item to the mook sheet");
        actor.handleMookDraggedItem(actor._getOwnedItem(itemData.id));
      }
    }
  });

  /**
   * preCreateItem Hook is provided by Foundry and triggered here. When an Item is created, this hook is called just
   * prior to creation.
   *
   * Hooks have a set of args that are passed to them from Foundry so in order to ensure that nothing is lost as part
   * of that call, all args are defined as part of the hook definition.
   *
   * @public
   * @memberof hookEvents
   * @param {CPRItem} item          The pending document which is requested for creation
   * @param {object} itemData       The initial data object provided to the document creation request
   * @param {object} options        Additional options which modify the creation request
   * @param {string} userId         The ID of the requesting user, always game.user.id
   * @return {boolean|void}         Explicitly return false to prevent creation of this Document
   */
  Hooks.on("preCreateItem", (item, itemData, options, userId) => {
    LOGGER.trace("preCreateItem | actorHooks | Called.");
    const actor = item.parent;
    if (actor != null) {
      if (Object.values(actor.apps).some((app) => app instanceof CPRCharacterActorSheet
          || app instanceof CPRContainerActorSheet) && userId === game.user.data._id && !options.CPRsplitStack) {
        LOGGER.debug("Attempting to stack items");
        return actor.automaticallyStackItems(item);
      }
    }
    return true;
  });
};

export default actorHooks;
