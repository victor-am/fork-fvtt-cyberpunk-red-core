/* global Hooks game canvas */
import LOGGER from "../utils/cpr-logger.js";
import SystemUtils from "../utils/cpr-systemUtils.js";

const itemHooks = () => {
  Hooks.on("preCreateItem", (doc, createData, options, userId) => {
    LOGGER.trace("preCreateItem | itemHooks | Called.");
    /* This hook overrides Foundry's default item images when items are created in the sidebar.

      The first check makes sure the image isn't overridden if the item is dragged from a character sheet to the
      sidebar, or imported to the sidebar from a compendium. In both of these cases, createData.img is defined,
      whereas when creating an item from the sidebar directly, it is not.

      The second check makes sure the item isn't being created on an actor. This case is addressed in
      the function _createInventoryItem in cpr-character-sheet.js and cpr-container-sheet.js.
      */
    if ((typeof createData.img === "undefined") && doc.parent === null) {
      const itemImage = SystemUtils.GetDefaultImage("Item", createData.type);
      doc.data.update({ img: itemImage });
    }
  });
};

export default itemHooks;
