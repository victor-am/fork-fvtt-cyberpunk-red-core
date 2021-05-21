/* global ActorSheet mergeObject */
import LOGGER from "../../utils/cpr-logger.js";
import SystemUtils from "../../utils/cpr-systemUtils.js";

/**
 * Implement the Black-ICE sheet.
 * @extends {CPRActorSheet}
 */
export default class CPRBlackIceActorSheet extends ActorSheet {
  /** @override */
  static get defaultOptions() {
    LOGGER.trace("defaultOptions | CPRBlackIceActorSheet | Called.");
    return mergeObject(super.defaultOptions, {
      template: "systems/cyberpunk-red-core/templates/actor/black-ice/cpr-black-ice-sheet.hbs",
      width: 733,
      height: 203,
    });
  }
}
