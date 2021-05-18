/* global mergeObject getProperty $ */
import CPRActorSheet from "./cpr-actor-sheet.js";
import ModMookSkillPrompt from "../../dialog/cpr-mod-mook-skill-prompt.js";
import LOGGER from "../../utils/cpr-logger.js";
import SystemUtils from "../../utils/cpr-systemUtils.js";
import MookNamePrompt from "../../dialog/cpr-mook-name-prompt.js";

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
      width: 750,
      height: 500,
    });
  }

  activateListeners(html) {
    LOGGER.trace("activateListeners | CPRMookActorSheet | Called.");
    super.activateListeners(html);
    html.find(".mod-mook-skill").click(() => this._modMookSkill());
    html.find(".change-mook-name").click(() => this._changeMookName());
  }

  async _modMookSkill() {
    LOGGER.trace("_modMookSkill | CPRMookActorSheet | Called.");
    let again = true;
    const skillList = [];
    this.actor.data.filteredItems.skill.map((s) => {
      LOGGER.debugObject(s);
      skillList.push(s.data.name);
      return skillList.sort();
    });
    while (again) {
      // eslint-disable-next-line no-await-in-loop
      const formData = await ModMookSkillPrompt.RenderPrompt({ skillList });
      const skill = this.actor.data.filteredItems.skill.filter((s) => s.name === formData.skillName)[0];
      skill.setSkillLevel(formData.skillLevel);
      skill.setSkillMod(formData.skillMod);
      this._updateOwnedItem(skill);
      // eslint-disable-next-line max-len
      const msg = `${SystemUtils.Localize("CPR.updated")} ${formData.skillName} ${SystemUtils.Localize("CPR.to")} ${formData.skillLevel}`;
      SystemUtils.DisplayMessage("notify", msg);
      again = formData.again;
    }
  }

  async _changeMookName() {
    const formData = await MookNamePrompt.RenderPrompt(this.actor.data.name);
    if (!this.isToken) {
      await this.actor.setMookName(formData);
    } else {
      await this.token.setMookName(formData);
    }
  }
}
