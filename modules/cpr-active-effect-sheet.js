/* global ActiveEffectConfig mergeObject */
/* eslint-env jquery */
import LOGGER from "./utils/cpr-logger.js";

/**
 * Extend the base ActiveEffect class to implement system-specific logic.
 * @extends {ActiveEffect}
 */
export default class CPRActiveEffectSheet extends ActiveEffectConfig {
  /**
   * We provide our own ActiveEffects sheet to improve the UX a bit. Specifically this
   * allows us to implement user-readable keys for the mods, and different "usage" types.
   * Most of that logic lives in cpr-active-effect.js.
   */
  static get defaultOptions() {
    LOGGER.trace("defaultOptions | CPRActiveEffectSheet | Called.");
    return mergeObject(super.defaultOptions, {
      template: "systems/cyberpunk-red-core/templates/effects/cpr-active-effect-sheet.hbs",
      width: 745,
      height: 500,
    });
  }

  /**
   * Some elements of the active effects sheet need special handling when they are changed
   * because of the flag limitation imposed by Foundry.
   *
   * @param {Object} html - the DOM object
   */
  activateListeners(html) {
    LOGGER.trace("activateListeners | CPRActiveEffectSheet | Called.");
    super.activateListeners(html);
    if (!this.options.editable) return;

    // QoL - Select all text when grabbing text input.
    $("input[type=text]").focusin(() => $(this).select());

    html.find(".effect-usage").change((event) => this._changeEffectUsage(event));
  }

  /**
   * Change how an active effect is used.
   *
   * @param {Object} event
   */
  async _changeEffectUsage(event) {
    LOGGER.trace("_changeEffectUsage | CPRActiveEffectSheet | Called.");
    LOGGER.debug(`Setting active usage flag to ${event.target.value}`);
    const effect = this.object;
    effect.usage = event.target.value;
  }

  /*
  getItem() {
    return this.object.origin;
  }
  */
}
