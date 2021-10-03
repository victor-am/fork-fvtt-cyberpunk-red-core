/* global $ */

import LOGGER from "../../utils/cpr-logger.js";
import SystemUtils from "../../utils/cpr-systemUtils.js";

const Effects = function Effects() {
  this.manageEffects = function manageEffects(event) {
    LOGGER.trace("manageEffects | Effects | Called.");
    event.preventDefault();
    const action = $(event.currentTarget).attr("data-effect-action");
    switch (event.action) {
      case "add":
        return this.addEffect();
      case "edit": {
        const effectId = $(event.currentTarget).attr("data-effect-id");
        const effect = this.items.find((i) => i.data._id === effectId);
        return this.editEffect(effect);
      }
      case "delete": {
        const effectId = $(event.currentTarget).attr("data-effect-id");
        const effect = this.items.find((i) => i.data._id === effectId);
        return this.deleteEffect(effect);
      }
      case "toggle": {
        const effectId = $(event.currentTarget).attr("data-effect-id");
        const effect = this.items.find((i) => i.data._id === effectId);
        return this.toggleEffect(effect);
      }
      default:
        LOGGER.error(`Unknown effects action: ${action}`);
    }
    return null;
  };

  // it would be nice to add custom properties, but they seem to be ignored by Foundry
  this.addEffect = function addEffect() {
    LOGGER.trace("addEffect | Effects | Called.");
    return this.createEmbeddedDocuments("ActiveEffect", [{
      label: SystemUtils.Localize("CPR.itemSheet.effects.newEffect"),
      icon: "icons/svg/aura.svg",
      origin: this.uuid,
      disabled: false,
    }]);
  };

  this.deleteEffect = function deleteEffect(eid) {
    LOGGER.trace("deleteEffect | Effects | Called.");
    const effect = this.getEffect(eid);
    return effect.delete();
  };

  this.editEffect = function editEffect(eid) {
    LOGGER.trace("editEffect | Effects | Called.");
    const effect = this.getEffect(eid);
    return effect.sheet.render(true);
  };

  this.getEffect = function getEffect(eid) {
    LOGGER.trace("getEffect | Effects | Called.");
    const effect = this.data.effects.get(eid);
    if (!effect) {
      LOGGER.error(`Active effect ${eid} does not exist!`);
      return null;
    }
    return effect;
  };

  this.getAllEffects = function getAllEffects() {
    LOGGER.trace("getAllEffects | Effects | Called.");
    return this.data.effects;
  };

  this.renameEffect = function renameEffect(eid, name) {
    LOGGER.trace("setModOnEffect | Effects | Called.");
    const effect = this.getEffect(eid);
    LOGGER.debug(`Setting name on ${eid} to ${name}`);
    return effect.update({ label: name });
  };

  this.setModOnEffect = function setModonEffect(eid, stat, value) {
    LOGGER.trace("setModOnEffect | Effects | Called.");
    const effect = this.getEffect(eid);
    // check that ability is valid!
    const changes = effect.data.changes.push({ stat: value });
    effect.update({ changes });
    return effect;
  };

  this.toggleEffect = function toggleEffect(eid) {
    LOGGER.trace("toggleEffect | Effects | Called.");
    const effect = this.getEffect(eid);
    const value = !effect.data.disabled;
    LOGGER.debug(`Setting disabled on ${eid} to ${value}`);
    return effect.update({ disabled: value });
  };
};

export default Effects;
