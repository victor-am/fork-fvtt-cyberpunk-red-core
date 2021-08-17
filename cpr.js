/* global Actors ActorSheet CONFIG Hooks Items ItemSheet game isNewerVersion */
// Object imports
import actorConstructor from "./modules/actor/actor-factory.js";
import CPRBlackIceActorSheet from "./modules/actor/sheet/cpr-black-ice-sheet.js";
import CPRCharacterActorSheet from "./modules/actor/sheet/cpr-character-sheet.js";
import CPRContainerActorSheet from "./modules/actor/sheet/cpr-container-sheet.js";
import CPRDemonActorSheet from "./modules/actor/sheet/cpr-demon-sheet.js";
import CPRMookActorSheet from "./modules/actor/sheet/cpr-mook-sheet.js";
import CPRCombat from "./modules/combat/cpr-combat.js";
import CPRItem from "./modules/item/cpr-item.js";

import CPRItemSheet from "./modules/item/sheet/cpr-item-sheet.js";
import LOGGER from "./modules/utils/cpr-logger.js";
import CPRMacro from "./modules/utils/cpr-macros.js";
import SystemUtils from "./modules/utils/cpr-systemUtils.js";
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
  Actors.registerSheet("cyberpunk-red-core", CPRCharacterActorSheet,
    { label: SystemUtils.Localize("CPR.sheets.characterSheet"), types: ["character", "mook"], makeDefault: true });
  Actors.registerSheet("cyberpunk-red-core", CPRBlackIceActorSheet,
    { label: SystemUtils.Localize("CPR.sheets.blackiceSheet"), types: ["blackIce"], makeDefault: true });
  Actors.registerSheet("cyberpunk-red-core", CPRContainerActorSheet,
    { label: SystemUtils.Localize("CPR.sheets.containerSheet"), types: ["container"], makeDefault: true });
  Actors.registerSheet("cyberpunk-red-core", CPRDemonActorSheet,
    { label: SystemUtils.Localize("CPR.sheets.demonSheet"), types: ["demon"], makeDefault: true });
  Actors.registerSheet("cyberpunk-red-core", CPRMookActorSheet,
    { label: SystemUtils.Localize("CPR.sheets.mookSheet"), types: ["character", "mook"] });

  // Register Item Sheet Application Classes
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("cyberpunk-red-core", CPRItemSheet, {
    types: [
      "ammo",
      "armor",
      "clothing",
      "criticalInjury",
      "cyberdeck",
      "cyberware",
      "gear",
      "itemUpgrade",
      "netarch",
      "program",
      "role",
      "skill",
      "vehicle",
      "weapon",
    ],
    makeDefault: true,
  });

  game.cpr = {
    apps: {
      CPRBlackIceActorSheet,
      CPRCharacterActorSheet,
      CPRContainerActorSheet,
      CPRDemonActorSheet,
      CPRMookActorSheet,
      CPRItemSheet,
    },
    macro: CPRMacro,
  };

  // Assign the actor class to the CONFIG
  CONFIG.Actor.documentClass = actorConstructor;
  CONFIG.Combat.documentClass = CPRCombat;
  CONFIG.Item.documentClass = CPRItem;

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
  const DATA_MODEL_VERSION = "0.79.0";
  // Get the version of the data model being used for the loaded world. At
  // the end of a migration, this is updated with the current version of the
  // CPR system.
  if (!game.settings.get("cyberpunk-red-core", "dataModelVersion")) {
    game.settings.set("cyberpunk-red-core", "dataModelVersion", DATA_MODEL_VERSION);
  } else {
    const dataModelVersion = game.settings.get("cyberpunk-red-core", "dataModelVersion");
    // Determine if we need to perform a migration
    const needsMigration = dataModelVersion && isNewerVersion(DATA_MODEL_VERSION, dataModelVersion);
    if (!needsMigration) return;
    Migration.migrateWorld(dataModelVersion, DATA_MODEL_VERSION);
  }
});

registerHooks();
