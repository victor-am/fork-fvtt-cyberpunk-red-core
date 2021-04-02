/* global Actors ActorSheet CONFIG Hooks Items ItemSheet game isNewerVersion */
// Object imports
import CPRActor from "./modules/actor/cpr-actor.js";
import CPRActorSheet from "./modules/actor/sheet/cpr-actor-sheet.js";
import CPRCharacterActorSheet from "./modules/actor/sheet/cpr-character-sheet.js";
import CPRMookActorSheet from "./modules/actor/sheet/cpr-mook-sheet.js";
import CPRItem from "./modules/item/cpr-item.js";
import CPRItemSheet from "./modules/item/sheet/cpr-item-sheet.js";
import LOGGER from "./modules/utils/cpr-logger.js";
import CPRMacro from "./modules/utils/cpr-macros.js";

import Migration from "./modules/system/migration.js";

// Function imports
import registerHooks from "./modules/system/hooks.js";
import preloadHandlebarsTemplates from "./modules/system/preload-templates.js";
import registerHandlebarsHelpers from "./modules/system/register-helpers.js";
import overrideRulerFunctions from "./modules/system/overrides.js";

// System settings
import registerSystemSettings from "./modules/system/settings.js";

Hooks.once("init", async () => {
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
      "cyberdeck",
      "program",
      "netarch",
    ],
    makeDefault: true,
  });

  game.cpr = {
    apps: {
      CPRActorSheet,
      CPRCharacterActorSheet,
      CPRMookActorSheet,
      CPRItemSheet,
    },
    entities: {
      CPRActor,
      CPRItem,
    },
    macro: CPRMacro,
  };

  // Assign the actor class to the CONFIG
  CONFIG.Actor.entityClass = CPRActor;
  CONFIG.Item.entityClass = CPRItem;

  preloadHandlebarsTemplates();
  registerHandlebarsHelpers();
  registerSystemSettings();
  overrideRulerFunctions();
});

Hooks.once("ready", () => {
  // Determine whether a system migration is required
  if (!game.user.isGM) return;
  // This defines the version of the Data Model for this release.  We should
  // only update this when the Data Model Changes.
  const DATA_MODEL_VERSION = "0.72";
  // Get the version of the data model being used for the loaded world. At
  // the end of a migration, this is updated with the current version of the
  // CPR system.
  const dataModelVersion = game.settings.get("cyberpunk-red-core", "dataModelVersion") ? game.settings.get("cyberpunk-red-core", "dataModelVersion") : "0.52";
  // Determine if we need to perform a migration
  const needsMigration = dataModelVersion && isNewerVersion(DATA_MODEL_VERSION, dataModelVersion);
  if (!needsMigration) return;
  Migration.migrateWorld(dataModelVersion);
});

registerHooks();
