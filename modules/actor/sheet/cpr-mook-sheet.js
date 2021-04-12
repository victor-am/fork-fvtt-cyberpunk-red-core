/* global mergeObject getProperty $ */
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

  activateListeners(html) {
    LOGGER.trace("activateListeners | CPRMookActorSheet | Called.");
    // clicking
    html.find(".ablate").click((event) => this._ablateArmor(event));
    html.find(".mook-fire-mode").click((event) => this._fireCheckboxToggle(event));
    html.find(".item-action").click((event) => this._itemAction(event));
    html.find(".item-edit").click((event) => this._renderItemCard(event));
    html.find(".mod-mook-skill").click(() => this._modMookSkill());
    html.find(".reset-value").click((event) => this._resetActorValue(event));
    html.find(".rollable").click((event) => this._onRoll(event));

    // dragging
    const handler = (event) => this._onDragItemStart(event);
    html.find(".item").each((i, li) => {
      li.setAttribute("draggable", true);
      li.addEventListener("dragstart", handler, false);
    });
  }

  async _modMookSkill() {
    LOGGER.trace("_modMookSkill | CPRMookActorSheet | Called.");
    let again = true;
    const skillList = [];
    this.actor.data.filteredItems.skill.map((s) => {
      LOGGER.debugObject(s);
      skillList.push(s.data.name);
      return skillList;
    });
    while (again) {
      // eslint-disable-next-line no-await-in-loop
      const formData = await ModMookSkillPrompt.RenderPrompt({ skillList });
      const skill = this.actor.data.filteredItems.skill.filter((s) => s.name === formData.skillName)[0];
      skill.setSkillLevel(formData.skillLevel);
      this._updateOwnedItem(skill);
      // eslint-disable-next-line max-len
      const msg = `${SystemUtils.Localize("CPR.updated")} ${formData.skillName} ${SystemUtils.Localize("CPR.to")} ${formData.skillLevel}`;
      SystemUtils.DisplayMessage("notify", msg);
      again = formData.again;
    }
  }

  /** @override */
  _fireCheckboxToggle(event) {
    LOGGER.trace("_fireCheckboxToggle Called | CPRMookActorSheet | Called.");
    const weaponID = $(event.currentTarget).attr("data-item-id");
    const firemode = $(event.currentTarget).attr("data-fire-mode");
    const flag = getProperty(this.actor.data, `flags.cyberpunk-red-core.firetype-${weaponID}`);
    LOGGER.debugObject(this.actor);
    LOGGER.debug(`firemode is ${firemode}`);
    LOGGER.debug(`weaponID is ${weaponID}`);
    LOGGER.debug(`flag is ${flag}`);
    if (flag === firemode) {
      // if the flag was already set to firemode, that means we unchecked a box
      this.actor.unsetFlag("cyberpunk-red-core", `firetype-${weaponID}`);
    } else {
      this.actor.setFlag("cyberpunk-red-core", `firetype-${weaponID}`, firemode);
    }
  }

  /** @override */
  _onDragItemStart(event) {
    LOGGER.trace("_onDragItemStart | CPRMookActorSheet | called.");
    super._onDragItemStart(event);
    // auto-equip the item
    const itemId = event.currentTarget.getAttribute("data-item-id");
    const item = this.actor.getEmbeddedEntity("OwnedItem", itemId);
    this._updateOwnedItemProp(item, "data.equipped", "equipped");
  }
}
