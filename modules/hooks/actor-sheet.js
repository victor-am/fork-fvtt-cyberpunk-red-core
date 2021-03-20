/* global Hooks */
/* eslint no-unused-vars:1 */
import LOGGER from "../utils/cpr-logger.js";
import SystemUtils from "../utils/cpr-systemUtils.js";

const actorSheetHooks = () => {
  Hooks.on("closeActorSheet", (actorSheet) => {
    LOGGER.trace("\"closeActorSheet | actorSheetHooks | Called.\"");
    SystemUtils.SetUserSetting("sheetConfig", "sheetCollapsedSections", actorSheet.options.collapsedSections, actorSheet.id);
    actorSheet.options.setConfig = true;
  });
};

export default actorSheetHooks;
