/* global game */
import LOGGER from "../utils/cpr-logger.js";

const registerSystemSettings = () => {
  game.settings.register("cyberpunk-red-core", "calculateDerivedStats", {
    name: "CPR.settingderivedstatsname",
    hint: "CPR.settingderivedstatshint",
    scope: "world",
    config: true,
    type: Boolean,
    default: true,
    onChange: (value) => {
      LOGGER.log(`Changed calculateDerivedStats to ${value}`);
    },
  });

  game.settings.register("cyberpunk-red-core", "playersCreateInventory", {
    name: "CPR.settingplayerscreateinventoryname",
    hint: "CPR.settingplayerscreateinventoryhint",
    scope: "world",
    config: true,
    type: Boolean,
    default: false,
    onChange: (value) => {
      LOGGER.log(`Changed playersCreateInventory to ${value}`);
    },
  });

  game.settings.register("cyberpunk-red-core", "deleteItemConfirmation", {
    name: "CPR.settingdeleteconfirmationname",
    hint: "CPR.settingdeleteconfirmationhint",
    scope: "client",
    config: true,
    type: Boolean,
    default: true,
    onChange: (value) => {
      LOGGER.log(`Changed deleteItemConfirmation to ${value}`);
    },
  });

  game.settings.register("cyberpunk-red-core", "enablePauseAnimation", {
    name: "CPR.enablepauseanimation",
    hint: "CPR.enablepauseanimationhint",
    scope: "client",
    config: true,
    type: Boolean,
    default: true,
    onChange: (value) => {
      LOGGER.log(`Changed enablePauseAnimation to ${value}`);
    },
  });

  game.settings.register("cyberpunk-red-core", "invertRollCtrlFunction", {
    name: "CPR.settinginvertrollctrlfunctionname",
    hint: "CPR.settinginvertrollctrlfunctionhint",
    scope: "client",
    config: true,
    type: Boolean,
    default: false,
    onChange: (value) => {
      LOGGER.log(`Changed invertRollCtrlFunction to ${value}`);
    },
  });

  game.settings.register("cyberpunk-red-core", "mookSheetSkillDisplay", {
    name: "CPR.settingmooksheetskilldisplay",
    hint: "CPR.settingmooksheetskilldisplayhint",
    scope: "client",
    config: true,
    type: String,
    choices: {
      level: "CPR.settingmooksheetskilldisplaylevel",
      base: "CPR.settingmooksheetskilldisplaybase",
      total: "CPR.settingmooksheetskilldisplaytotal",
    },
    default: "base",
    onChange: (value) => {
      LOGGER.log(`Changed mookSheetSkillDisplay to ${value}`);
    },
  });

  game.settings.register("cyberpunk-red-core", "preventDuplicateCriticalInjuries", {
    name: "CPR.settingpreventduplicatecriticalinjuriesname",
    hint: "CPR.settingpreventduplicatecriticalinjurieshint",
    scope: "world",
    config: true,
    type: String,
    choices: {
      off: "CPR.settingspreventduplicatecriticalinjuriesoff",
      warn: "CPR.settingspreventduplicatecriticalinjurieswarn",
      reroll: "CPR.settingspreventduplicatecriticalinjuriesreroll",
    },
    default: "off",
    onChange: (value) => {
      LOGGER.log(`Changed preventDuplicateCriticalInjuries to ${value}`);
    },
  });

  game.settings.register("cyberpunk-red-core", "automaticallyResizeSheets", {
    name: "CPR.settingautomaticallyResizeSheetsname",
    hint: "CPR.settingautomaticallyResizeSheetshint",
    scope: "client",
    config: true,
    type: Boolean,
    default: false,
    onChange: (value) => {
      LOGGER.log(`Changed automaticallyResizeSheets to ${value}`);
    },
  });

  game.settings.register("cyberpunk-red-core", "userSettings", {
    name: "User Settings",
    scope: "client",
    config: false,
    type: Object,
    default: {},
  });

  // Saves the last time a migration to a data model took place
  game.settings.register("cyberpunk-red-core", "dataModelVersion", {
    name: "CPR.systemdatamodelversion",
    hint: "CPR.systemdatamodelversionhint",
    scope: "world",
    config: true,
    type: String,
    default: "",
    onChange: (value) => {
      LOGGER.log(`Changed dataModelVersion to ${value}`);
    },
  });

  game.settings.register("cyberpunk-red-core", "debugLogs", {
    name: "CPR.debuglogs",
    hint: "CPR.debuglogshint",
    scope: "client",
    config: true,
    type: Boolean,
    default: false,
    onChange: (value) => {
      LOGGER.log(`Changed debugLogs to ${value}`);
    },
  });

  game.settings.register("cyberpunk-red-core", "debugElements", {
    name: "CPR.debugelements",
    hint: "CPR.debugelementshint",
    scope: "client",
    config: true,
    type: Boolean,
    default: false,
    onChange: (value) => {
      LOGGER.log(`Changed debugElements to ${value}`);
    },
  });

  game.settings.register("cyberpunk-red-core", "traceLogs", {
    name: "CPR.tracelogs",
    hint: "CPR.tracelogshint",
    scope: "client",
    config: true,
    type: Boolean,
    default: false,
    onChange: (value) => {
      LOGGER.log(`Changed traceLogs to ${value}`);
    },
  });
};

export default registerSystemSettings;
