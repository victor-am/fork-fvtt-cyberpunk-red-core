/* global mergeObject */
import CPRActorSheet from "./cpr-actor-sheet.js";
import ModMookSkillPrompt from "../../dialog/cpr-mod-mook-skill-prompt.js";
import LOGGER from "../../utils/cpr-logger.js";
import SystemUtils from "../../utils/cpr-systemUtils.js";

/**
 * Extend the basic CPRActorSheet.
 * @extends {CPRActorSheet}
 */
export default class CPRMookActorSheet extends CPRActorSheet {
  /** @override */
  static get defaultOptions() {
    LOGGER.trace("defaultOptions | CPRMookActorSheet | Called.");
    return mergeObject(super.defaultOptions, {
      template: "systems/cyberpunk-red-core/templates/actor/mooks/cpr-mook-sheet.hbs",
    });
  }

  /** @override */
  getData() {
    LOGGER.trace("getData | CPRMookActorSheet | Called.");
    const data = super.getData();
    return data;
  }

  activateListeners(html) {
    LOGGER.trace("activateListeners | CPRMookActorSheet | Called.");
    html.find(".ablate").click((event) => this._ablateArmor(event));
    html.find(".fire-checkbox").click((event) => this._fireCheckboxToggle(event));
    html.find(".item-edit").click((event) => this._renderItemCard(event));
    html.find(".mod-mook-skill").click(() => this._modMookSkill());
    html.find(".reset-value").click((event) => this._resetActorValue(event));
    html.find(".rollable").click((event) => this._onRoll(event));
  }

  async _modMookSkill() {
    LOGGER.trace("_modMookSkill | CPRMookActorSheet | Called.");
    let again = true;
    while (again) {
      // TODO - do this correctly with Promise.all()
      // TODO - sort the list of skills and pass into RenderPrompt
      // eslint-disable-next-line no-await-in-loop
      const formData = await ModMookSkillPrompt.RenderPrompt();
      const skill = this.actor.data.filteredItems.skill.filter((s) => s.name === formData.skillName)[0];
      skill.setSkillLevel(formData.skillLevel);
      this._updateOwnedItem(skill);
      const msg = `${SystemUtils.Localize("CPR.updated")} ${formData.skillName} ${SystemUtils.Localize("CPR.to")} ${formData.skillLevel}`;
      SystemUtils.DisplayMessage("notify", msg);
      again = formData.again;
    }
  }
}
