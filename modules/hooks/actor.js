/* global Hooks game */
import LOGGER from "../utils/cpr-logger.js";
import Rules from "../utils/cpr-rules.js";
import CPRCharacterActorSheet from "../actor/sheet/cpr-character-sheet.js";
import CPRContainerActorSheet from "../actor/sheet/cpr-container-sheet.js";
import CPRMookActorSheet from "../actor/sheet/cpr-mook-sheet.js";
import SystemUtils from "../utils/cpr-systemUtils.js";

/**
 * Hooks have a set of args that are passed to them from Foundry. Even if we do not use them here,
 * we document them all for clarity's sake and to make future development/debugging easier.
 */
const actorHooks = () => {
  /**
   * The preCreateActor Hook is provided by Foundry and triggered here. When an Actor is created, this hook is called just
   * prior to creation. In here, we inject a default portrait (icon) for the actor.
   *
   * @public
   * @memberof hookEvents
   * @param {Document} doc          The pending Actor document which is requested for creation
   * @param {object} createData     The initial data object provided to the document creation request
   * @param {object} (unused)       Additional options which modify the creation request
   * @param {string} (unused)       The ID of the requesting user, always game.user.id
   */
  Hooks.on("preCreateActor", (doc, createData) => {
    LOGGER.trace("preCreateActor | actorHooks | Called.");
    if ((typeof createData.img === "undefined")) {
      const actorImage = SystemUtils.GetDefaultImage("Actor", createData.type);
      doc.data.update({ img: actorImage });
    }
  });

  /**
   * The preUpdateActor Hook is provided by Foundry and triggered here. When an Actor is updated, this hook is called just
   * prior to update. This hook has 3 purposes.
   *
   * 1. Check the role stats and issue a warning if points are not allocated per rules
   * 2. If the corresponding token for the actor is displaying a resource bar for armor SP, update it to use newly equipped
   *    armor items when the equipment changes.
   * 3. If the actor being updated is Black-ICE, reflect those changes on the owned items too.
   *
   * @public
   * @memberof hookEvents
   * @param {CPRCharacterActor} actor     The pending document which is requested for creation
   * @param {object} updatedData          The changed data object provided to the document creation request
   * @param {object} (unused)             Additional options which modify the creation request
   * @param {string} userId               The ID of the requesting user, always game.user.id
   */
  Hooks.on("preUpdateActor", (actor, updatedData, _, userId) => {
    LOGGER.trace("preUpdateActor | actorHooks | Called.");
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
   * The createItem Hook is provided by Foundry and triggered here. When an Item is created, this hook is called during
   * creation. This hook handles items dragged on the mook sheet to automatically equip or install them.
   * TODO: this should be in the item.js hook code
   *
   * @public
   * @memberof hookEvents
   * @param {CPRItem} itemData            The pending document which is requested for creation
   * @param {object} (unused)             Additional options which modify the creation request
   * @param {string} userId               The ID of the requesting user, always game.user.id
   */
  Hooks.on("createItem", (itemData, _, userId) => {
    LOGGER.trace("createItem | actorHooks | Called.");
    const actor = itemData.parent;
    if (actor !== null) {
      if (itemData.type === "role") {
        const hasActiveRole = actor.data.filteredItems.role.some((r) => r.data.name === actor.data.data.roleInfo.activeRole);
        if (!hasActiveRole) {
          actor.update({ "data.roleInfo.activeRole": itemData.data.name });
        }
      }

      // when a new item is created (dragged) on a mook sheet, auto install or equip it
      if (Object.values(actor.apps).some((app) => app instanceof CPRMookActorSheet) && userId === game.user.data._id) {
        LOGGER.debug("handling a dragged item to the mook sheet");
        actor.handleMookDraggedItem(actor._getOwnedItem(itemData.id));
      }
    }
  });

  /**
   * The preCreateItem Hook is provided by Foundry and triggered here. When an Item is created, this hook is called just
   * prior to creation. This code handles the case where an item is being created but it should "stack" on top of an
   * existing item instead.
   * TODO: this should be in the item.js hook code
   *
   * @public
   * @memberof hookEvents
   * @param {CPRItem} item          The pending document which is requested for creation
   * @param {object} (unused)       The initial data object provided to the document creation request
   * @param {object} options        Additional options which modify the creation request
   * @param {string} userId         The ID of the requesting user, always game.user.id
   * @return {boolean|void}         Explicitly return false to prevent creation of this Document
   */
  Hooks.on("preCreateItem", (item, _, options, userId) => {
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
