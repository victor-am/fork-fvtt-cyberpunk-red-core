import LOGGER from "../../utils/cpr-logger.js";

/**
 * Extend the basic ActorSheet.
 * @extends {ItemSheet}
 */
export default class CPRItemSheet extends ItemSheet {


  static get defaultOptions() {
    LOGGER.trace("Default Options | CPRItemSheet | Called.");
    return mergeObject(super.defaultOptions, {
      tabs: [{ navSelector: ".tabs", contentSelector: ".content", initial: "main" }],
      width: 450,
      height: 300,
    });
  }

  get template() {
    LOGGER.trace(`Get Template | CPRItemSheet | Called with type ${this.item.type}.`);
    return `systems/cyberpunk-red-core/templates/item/cpr-${this.item.type}-sheet.hbs`;
  }

  get classes() {
    LOGGER.trace(`Get Classes | CPRItemSheet | Called with type ${this.item.type}.`);
    return super.defaultOptions.classes.concat(["sheet", "item", `${this.item.type}`]);
  }
}