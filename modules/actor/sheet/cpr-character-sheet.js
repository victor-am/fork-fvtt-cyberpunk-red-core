/* global mergeObject */
import CPRActorSheet from "./cpr-actor-sheet.js";
import LOGGER from "../../utils/cpr-logger.js";
import SystemUtils from "../../utils/cpr-systemUtils.js";

/**
 * Extend the basic CPRActorSheet.
 * @extends {CPRActorSheet}
 */
export default class CPRCharacterActorSheet extends CPRActorSheet {
  constructor(actor, options) {
    super(actor, options);

    // Moved this to the constructor since this only needs to be set on the Sheet Object
    // The first time it is created.  The contents are then loaded from the User Settings
    // if they exist.
    this.options.collapsedSections = [];
    const collapsedSections = SystemUtils.GetUserSetting("sheetConfig", "sheetCollapsedSections", this.id);
    if (collapsedSections) {
      this.options.collapsedSections = collapsedSections;
    }
  }

  /** @override */
  static get defaultOptions() {
    LOGGER.trace("defaultOptions | CPRCharacterActorSheet | Called.");
    return mergeObject(super.defaultOptions, {
      template: "systems/cyberpunk-red-core/templates/actor/cpr-character-sheet.hbs",
      tabs: [{ navSelector: ".navtabs-right", contentSelector: ".right-content-section", initial: "skills" },
        { navSelector: ".navtabs-bottom", contentSelector: ".bottom-content-section", initial: "fight" }],
    });
  }

  /** @override */
  getData() {
    LOGGER.trace("getData | CPRCharacterActorSheet | Called.");
    const data = super.getData();
    return data;
  }
}
