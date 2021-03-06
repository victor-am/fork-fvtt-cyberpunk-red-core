/* global mergeObject */
import CPRActorSheet from "./cpr-actor-sheet.js";
import LOGGER from "../../utils/cpr-logger.js";

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
      tabs: [{ navSelector: ".navtabs-right", contentSelector: ".right-content-section", initial: "skills" }, { navSelector: ".navtabs-bottom", contentSelector: ".bottom-content-section", initial: "fight" }],
    });
  }

  /** @override */
  getData() {
    LOGGER.trace("getData | CPRCharacterActorSheet | Called.");
    const data = super.getData();
    return data;
  }
}
