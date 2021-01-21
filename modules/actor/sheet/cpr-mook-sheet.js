/* global mergeObject */
import CPRActorSheet from "./cpr-actor-sheet";
import LOGGER from "../../utils/cpr-logger";

/**
 * Extend the basic CPRActorSheet.
 * @extends {CPRActorSheet}
 */
export default class CPRMookActorSheet extends CPRActorSheet {
  /** @override */
  static get defaultOptions() {
    LOGGER.trace("defaultOptions | CPRMookActorSheet | Called.");
    return mergeObject(super.defaultOptions, {
      template: "systems/cyberpunk-red-core/templates/actor/cpr-mook-sheet.hbs",
      tabs: [{ navSelector: ".tabs", ontentSelector: ".content", initial: "skills" }],
    });
  }

  /** @override */
  getData() {
    LOGGER.trace("getData | CPRMookActorSheet | Called.");
    const data = super.getData();
    return data;
  }
}
