/* global Hooks game canvas */
import LOGGER from "../utils/cpr-logger.js";

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
      switch (createData.type) {
        case "ammo": {
          doc.data.update({ img: "systems/cyberpunk-red-core/icons/compendium/default/Default_Ammo.svg" });
          break;
        }
        case "armor": {
          doc.data.update({ img: "systems/cyberpunk-red-core/icons/compendium/default/Default_Armor.svg" });
          break;
        }
        case "clothing": {
          doc.data.update({ img: "systems/cyberpunk-red-core/icons/compendium/default/Default_Clothing.svg" });
          break;
        }
        case "criticalInjury": {
          doc.data.update({ img: "systems/cyberpunk-red-core/icons/compendium/default/Default_Critical_Injury.svg" });
          break;
        }
        case "cyberdeck": {
          doc.data.update({ img: "systems/cyberpunk-red-core/icons/compendium/default/Default_Cyberdeck.svg" });
          break;
        }
        case "cyberware": {
          doc.data.update({ img: "systems/cyberpunk-red-core/icons/compendium/default/Default_Cyberware.svg" });
          break;
        }
        case "gear": {
          doc.data.update({ img: "systems/cyberpunk-red-core/icons/compendium/default/Default_Gear.svg" });
          break;
        }
        case "netarch": {
          doc.data.update({ img: "systems/cyberpunk-red-core/icons/compendium/default/Default_Net_Architecture.svg" });
          break;
        }
        case "program": {
          doc.data.update({ img: "systems/cyberpunk-red-core/icons/compendium/default/Default_Program.svg" });
          break;
        }
        case "skill": {
          doc.data.update({ img: "systems/cyberpunk-red-core/icons/compendium/default/Default_Skill.svg" });
          break;
        }
        case "vehicle": {
          doc.data.update({ img: "systems/cyberpunk-red-core/icons/compendium/default/Default_Vehicle.svg" });
          break;
        }
        case "weapon": {
          doc.data.update({ img: "systems/cyberpunk-red-core/icons/compendium/weapons/heavyPistol.svg" });
          break;
        }
        default:
      }
    }
  });
};

export default itemHooks;
