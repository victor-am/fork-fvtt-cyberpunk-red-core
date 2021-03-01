/* eslint-disable func-names */
/* eslint-disable import/prefer-default-export */
/* eslint-disable no-undef */
export const registerSystemSettings = function () {
  // Saves the last time a migration to a data model took place
  game.settings.register("cyberpunk-red-core", "dataModelVersion", {
    name: "System Data Model Version",
    scope: "world",
    config: true,
    type: String,
    default: "",
  });

  game.settings.register("cyberpunk-red-core", "calculateDerivedStats", {
    name: "CPR.settingderivedstatsname",
    hint: "CPR.settingderivedstatshint",
    scope: "world",
    config: true,
    type: Boolean,
    default: true,
  });

  game.settings.register("cyberpunk-red-core", "playersCreateInventory", {
    name: "CPR.settingplayerscreateinventoryname",
    hint: "CPR.settingplayerscreateinventoryhint",
    scope: "world",
    config: true,
    type: Boolean,
    default: false,
  });

  game.settings.register("cyberpunk-red-core", "deleteItemConfirmation", {
    name: "CPR.settingdeleteconfirmationname",
    hint: "CPR.settingdeleteconfirmationhint",
    scope: "client",
    config: true,
    type: Boolean,
    default: true,
  });

  game.settings.register("cyberpunk-red-core", "enablePauseAnimation", {
    name: "CPR.enablepauseanimation",
    hint: "CPR.enablepauseanimationhint",
    scope: "client",
    config: true,
    type: Boolean,
    default: true,
  });
};
