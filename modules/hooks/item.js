/* global Hooks */
import LOGGER from "../utils/cpr-logger.js";
import SystemUtils from "../utils/cpr-systemUtils.js";

/**
 * Hooks have a set of args that are passed to them from Foundry. Even if we do not use them here,
 * we document them all for clarity's sake and to make future development/debugging easier.
 */
const itemHooks = () => {
  /**
   * The preCreateItem Hook is provided by Foundry and triggered here. When an Item is created, this hook is called just
   * prior to creation. This hook overrides Foundry's default item images when items are created in the sidebar.
   * The first check makes sure the image isn't overridden if the item is dragged from a character sheet to the
   * sidebar, or imported to the sidebar from a compendium. In both of these cases, createData.img is defined,
   * whereas when creating an item from the sidebar directly, it is not.
   *
   * The second check makes sure the item isn't being created on an actor. This case is addressed in
   * the function _createInventoryItem in cpr-character-sheet.js and cpr-container-sheet.js.
   *
   * @public
   * @memberof hookEvents
   * @param {Document} doc          The Item document which is requested for creation
   * @param {object} createData     A trimmed object with the data provided for creation
   * @param {object} (unused)       Additional options which modify the creation request
   * @param {string} (unused)       The ID of the requesting user, always game.user.id
   */
  Hooks.on("preCreateItem", (doc, createData) => {
    LOGGER.trace("preCreateItem | itemHooks | Called.");
    if ((typeof createData.img === "undefined") && doc.parent === null) {
      const itemImage = SystemUtils.GetDefaultImage("Item", createData.type);
      doc.data.update({ img: itemImage });
    }
  });
};

export default itemHooks;
