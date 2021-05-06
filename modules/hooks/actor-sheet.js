/* global Hooks game */
import LOGGER from "../utils/cpr-logger.js";
import SystemUtils from "../utils/cpr-systemUtils.js";

const actorSheetHooks = () => {
  Hooks.on("closeActorSheet", (actorSheet) => {
    LOGGER.trace("closeActorSheet | actorSheetHooks | Called.");
    SystemUtils.SetUserSetting("sheetConfig", "sheetCollapsedSections",
      actorSheet.options.collapsedSections, actorSheet.id);
    actorSheet.options.setConfig = true;
  });

  /*
  Hooks.on("renderCPRMookActorSheet", (actorSheet) => {
    LOGGER.trace("renderCPRMookActorSheet | actorSheetHooks | Called.");
    const actor = game.actors.find((a) => a._id === actorSheet.object.data._id);
    LOGGER.debugObject(actor);
    const item = actor.getFlag("cyberpunk-red-core", "post-drag-item");
    LOGGER.debugObject(item);
    if (typeof item !== "undefined") {
      LOGGER.debug("handling a dragged item");
      actor.handleMookDraggedItem(actor, actor._getOwnedItem(item._id));
      actor.unsetFlag("cyberpunk-red-core", "post-drag-item");
    }
  });
  */
};
export default actorSheetHooks;
