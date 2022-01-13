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
const itemHooks = () => {
  /**
   * The preCreateItem Hook is provided by Foundry and triggered here. When an Item is created, this hook is called just
   * prior to creation. This hook provides the following functionality:
   *
   * - Overrides Foundry's default item images when items are created in the sidebar.
   *   The first check makes sure the image isn't overridden if the item is dragged from a character sheet to the
   *   sidebar, or imported to the sidebar from a compendium. In both of these cases, createData.img is defined,
   *   whereas when creating an item from the sidebar directly, it is not.
   *
   *   The second check makes sure the item isn't being created on an actor. This case is addressed in
   *   the function _createInventoryItem in cpr-character-sheet.js and cpr-container-sheet.js.
   *
   *  - This code handles the case where an item is being created but it should "stack" on top of an
   *    existing item instead.
   *
   * @public
   * @memberof hookEvents
   * @param {Document} doc          The Item document which is requested for creation
   * @param {object} createData     A trimmed object with the data provided for creation
   * @param {object} options        Additional options which modify the creation request
   * @param {string} userId         The ID of the requesting user, always game.user.id
   */
  Hooks.on("preCreateItem", (doc, createData, options, userId) => {
    LOGGER.trace("preCreateItem | itemHooks | Called.");

    const actor = doc.parent;

    if ((typeof createData.img === "undefined") && actor === null) {
      const itemImage = SystemUtils.GetDefaultImage("Item", createData.type);
      doc.data.update({ img: itemImage });
    }

    if (actor != null) {
      if (Object.values(actor.apps).some((app) => app instanceof CPRCharacterActorSheet
          || app instanceof CPRContainerActorSheet) && userId === game.user.data._id && !options.CPRsplitStack) {
        LOGGER.debug("Attempting to stack items");
        actor.automaticallyStackItems(doc);
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
  Hooks.on("createItem", (doc, _, userId) => {
    LOGGER.trace("createItem | actorHooks | Called.");
    const actor = doc.parent;
    if (actor !== null) {
      if (doc.type === "role" && actor.data.data.roleInfo.activeRole === "") {
        actor.update({ "data.roleInfo.activeRole": doc.data.name });
      }

      // when a new item is created (dragged) on a mook sheet, auto install or equip it
      if (Object.values(actor.apps).some((app) => app instanceof CPRMookActorSheet) && userId === game.user.data._id) {
        LOGGER.debug("handling a dragged item to the mook sheet");
        actor.handleMookDraggedItem(actor._getOwnedItem(doc.id));
      }
    }
  });

  /**
   * The deleteItem Hook is provided by Foundry and triggered here. When an Item is deleted, this hook is called during
   * deletion.
   *
   * @public
   * @memberof hookEvents
   * @param {CPRItem} itemData            The pending document which is requested for creation
   * @param {object} (unused)             Additional options which modify the creation request
   * @param {string} (unused)               The ID of the requesting user, always game.user.id
   */

  Hooks.on("deleteItem", (doc) => {
    LOGGER.trace("deleteItem | itemHooks | Called.");
    const actor = doc.parent;
    if (actor !== null) {
      if (doc.type === "role" && actor.data.data.roleInfo.activeRole === doc.name) {
        if (actor.data.filteredItems.role.length >= 1) {
          const newActiveRole = actor.data.filteredItems.role
            .sort((a, b) => (a.data.name > b.data.name ? 1 : -1))
            .find((r) => r.data.name !== actor.data.data.roleInfo.activeRole);
          actor.update({ "data.roleInfo.activeRole": newActiveRole.data.name });
          const warning = `${SystemUtils.Localize("CPR.messages.warnDeleteActiveRole")} ${newActiveRole.data.name}`;
          SystemUtils.DisplayMessage("warn", warning);
        } else {
          actor.update({ "data.roleInfo.activeRole": "" });
          SystemUtils.DisplayMessage("warn", SystemUtils.Localize("CPR.characterSheet.bottomPane.role.noRolesWarning"));
        }
      }
    }
  });

  /**
   * The updateItem Hook is provided by Foundry and triggered here. When an Item is updated, this hook is called
   * right after. When an item is updated (specifically a role item) we check to see if a multiplier is set.
   * If it is, we set values for the "sub-roles."
   *
   * @public
   * @memberof hookEvents
   * @param {Document} doc          The Item document which is requested for creation
   * @param {object} updateData     A trimmed object with the data provided for creation
   * @param {object} (unused)       Additional options which modify the creation request
   * @param {string} (unused)       The ID of the requesting user, always game.user.id
   */
  Hooks.on("updateItem", (doc, updateData) => {
    LOGGER.trace("updateItem | itemHooks | Called.");
    if (updateData.data && updateData.data.abilities) {
      const roleRank = doc.data.data.rank;
      let subRolesValue = 0;
      doc.data.data.abilities.forEach((a) => {
        if (a.multiplier !== "--") {
          subRolesValue += (a.rank * a.multiplier);
        }
      });
      if (subRolesValue > roleRank) {
        Rules.lawyer(false, "CPR.messages.invalidRoleData");
      }
    }
  });
};

export default itemHooks;
