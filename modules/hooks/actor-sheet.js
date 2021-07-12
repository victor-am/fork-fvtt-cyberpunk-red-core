/* global Hooks */
import LOGGER from "../utils/cpr-logger.js";
import SystemUtils from "../utils/cpr-systemUtils.js";

const actorSheetHooks = () => {
  Hooks.on("closeActorSheet", (actorSheet) => {
    LOGGER.trace("closeActorSheet | actorSheetHooks | Called.");
    SystemUtils.SetUserSetting("sheetConfig", "sheetCollapsedSections",
      actorSheet.options.collapsedSections, actorSheet.id);
    // eslint-disable-next-line no-param-reassign
    actorSheet.options.setConfig = true;
  });
};
export default actorSheetHooks;
