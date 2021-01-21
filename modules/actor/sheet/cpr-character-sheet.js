/* global mergeObject */
import CPRActorSheet from "./cpr-actor-sheet";
import LOGGER from "../../utils/cpr-logger";

/**
 * Extend the basic CPRActorSheet.
 * @extends {CPRActorSheet}
 */
export default class CPRCharacterActorSheet extends CPRActorSheet {
  /** @override */
  static get defaultOptions() {
    LOGGER.trace("defaultOptions | CPRCharacterActorSheet | Called.");
    return mergeObject(super.defaultOptions, {
      template: "systems/cyberpunk-red-core/templates/actor/cpr-character-sheet.hbs",
      tabs: [{ navSelector: ".tabs", contentSelector: ".content", initial: "skills" }],
    });
  }

  /** @override */
  getData() {
    LOGGER.trace("getData | CPRCharacterActorSheet | Called.");
    const data = super.getData();
    return data;
  }
}
