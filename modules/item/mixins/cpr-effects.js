/* global game */
import LOGGER from "../../utils/cpr-logger.js";

const Effects = function Effects() {
  this.manageEffects = function manageEffects(event, item) {
    LOGGER.trace("manageEffects | Effects | Called.");
    event.preventDefault();
    const effectId = null; // TODO
    const effect = null; // TODO
    const action = null; // TODO
    switch (event.action) {
      case "add":
        return this.addEffect(item);
      case "edit":
        return this.editEffect(effect);
      case "delete":
        return this.deleteEffect(effect);
      case "toggle":
        return this.toggleEffect(effect);
      default:
        LOGGER.error(`Unknown effects action: ${action}`);
    }
    return null;
  };

  this.addEffect = function addEffect(item) {
    LOGGER.trace("addEffect | Effects | Called.");
    return item.createEmbeddedDocuments("ActiveEffect", [{
      label: game.i18n.localize("DND5E.EffectNew"),
      icon: "icons/svg/aura.svg",
      origin: item.uuid,
      // "duration.rounds": li.dataset.effectType === "temporary" ? 1 : undefined,
      disabled: li.dataset.effectType === "inactive",
    }]);
  };

  this.editEffect = function editEffect(effect) {
    LOGGER.trace("editEffect | Effects | Called.");
    return effect.sheet.render(true);
  };

  this.toggleEffect = function toggleEffect(effect) {
    LOGGER.trace("toggleEffect | Effects | Called.");
    return effect.update({ disabled: !effect.data.disabled });
  };

  this.deleteEffect = function deleteEffect(effect) {
    LOGGER.trace("deleteEffect | Effects | Called.");
    return effect.delete();
  };
};

export default Effects;
