/* global Hooks game canvas */
import LOGGER from "../utils/cpr-logger.js";

const itemHooks = () => {
  Hooks.on("preCreateItem", (doc, createData, options, userId) => {
    LOGGER.trace("preCreateItem | itemHooks | Called.");
    /* This hook overrides Foundry's default item images when items are created in, dragged to, or imported to the
      sidebar.

      The first check makes sure the image isn't overridden if the item is dragged from the character sheet to the
      sidebar. This is the case if createData.img is defined. This addresses the niche case where a user chooses the
      default item-bag.svg from Foundry for an item on their sheet, and then drags it to the sidebar.

      The second check makes sure the item isn't being created on an actor.

      The third check makes sure that the image isn't overridden when being imported from the compendium. That is,
      it verifies that the item being created is trying to use the default Foundry item image.
      */
    if ((typeof createData.img === "undefined") && doc.parent === null && doc.data.img === "icons/svg/item-bag.svg") {
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
