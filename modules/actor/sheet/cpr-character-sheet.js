import CPRActorSheet from "./cpr-actor-sheet.js";
import LOGGER from "../../utils/cpr-logger.js";

/**
 * Extend the basic CPRActorSheet.
 * @extends {CPRActorSheet}
 */
export default class CPRCharacterActorSheet extends CPRActorSheet {

  /** @override */
  static get defaultOptions() {
    LOGGER.trace("Default Options | CPRCharacterActorSheet | Called.");
    return mergeObject(super.defaultOptions, {
      template: "systems/cyberpunk-red-core/templates/actor/cpr-character-sheet.hbs",
      tabs: [{ navSelector: ".tabs", contentSelector: ".content", initial: "skills" }],
    });
  }

  /** @override */
  getData() {
    LOGGER.trace("Get Data | CPRCharacterActorSheet | Called.");
    const data = super.getData();

    
    

    
    
    return data;
  }
}