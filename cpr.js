
// Object imports
import CPRActor from "./modules/actor/cpr-actor.js";
import CPRActorSheet from "./modules/actor/sheet/cpr-actor-sheet.js";
import CPRCharacterActorSheet from "./modules/actor/sheet/cpr-character-sheet.js";
import CPRMookActorSheet from "./modules/actor/sheet/cpr-mook-sheet.js";
import CPRItem from "./modules/item/cpr-item.js";
import CPRItemSheet from "./modules/item/sheet/cpr-item-sheet.js";

import LOGGER from "./modules/utils/cpr-logger.js";

// Function imports
import registerHooks from "./modules/system/hooks.js";
import preloadHandlebarsTemplates from "./modules/system/preload-templates.js";

Hooks.once("init", async function () {
  LOGGER.log("THANK YOU TO EVERYONE WHO HELPED!!!!");
  LOGGER.credits();
  // Register Actor Sheet Application Classes
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("cyberpunk-red-core", CPRCharacterActorSheet, { types: ["character"], makeDefault: true });
  Actors.registerSheet("cyberpunk-red-core", CPRMookActorSheet, { types: ["mook"], makeDefault: true });

  // Register Item Sheet Application Classes
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("cyberpunk-red-core", CPRItemSheet, {
    types: [
      "cyberware",
      "weapon",
      "armor",
      "ammo",
      "gear",
      "skill",
      "vehicle",
      "program",
      "netarch",
      "loot"
    ], makeDefault: true
  });

  // Give ourselves console access to our objects
  game.cpr = {
    apps: {
      CPRActorSheet,
      CPRCharacterActorSheet,
      CPRMookActorSheet,
      CPRItemSheet
    },
    entities: {
      CPRActor,
      CPRItem
    },
  }

  // Assign the actor class to the CONFIG
  CONFIG.Actor.entityClass = CPRActor;
  CONFIG.Item.entityClass = CPRItem;

  preloadHandlebarsTemplates();
});
registerHooks();