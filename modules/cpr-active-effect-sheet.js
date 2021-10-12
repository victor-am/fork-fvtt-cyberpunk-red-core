/* global ActiveEffectConfig mergeObject */
import LOGGER from "./utils/cpr-logger.js";

/**
 * Extend the base ActiveEffect class to implement system-specific logic.
 * @extends {ActiveEffect}
 */
export default class CPRActiveEffectSheet extends ActiveEffectConfig {
  /**
   * We provide our own ActiveEffects sheet to improve the UX a bit. Specifically this
   * allows us to implement user-readable keys for the mods, and different activation types.
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
}
