/* global mergeObject */
import CPRActorSheet from "./cpr-actor-sheet.js";
import LOGGER from "../../utils/cpr-logger.js";
import SystemUtils from "../../utils/cpr-systemUtils.js";

/**
 * Implement the sheet for containers and shop keepers.
 * @extends {CPRActorSheet}
 */
export default class CPRContainerActorSheet extends CPRActorSheet {
  /** @override */
  static get defaultOptions() {
    LOGGER.trace("defaultOptions | CPRContainerActorSheet | Called.");
    return mergeObject(super.defaultOptions, {
      template: "systems/cyberpunk-red-core/templates/actor/work-in-progress.hbs",
      width: 750,
      height: 500,
    });
  }
}
