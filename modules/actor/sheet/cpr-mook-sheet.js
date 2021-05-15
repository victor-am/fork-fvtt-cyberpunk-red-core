/* global mergeObject, getProperty, $, duplicate */
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
    html.find(".mook-image-toggle").click((event) => this._expandMookImage(event));
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

  _expandMookImage(event) {
    LOGGER.trace("_expandMookImage | CPRMookActorSheet | Called.");
    const mookImageArea = $(event.currentTarget).parents(".mook-image");
    const mookImageImg = $(event.currentTarget).parents(".mook-image").children(".mook-image-block");
    const mookImageToggle = $(event.currentTarget);
    console.log(this);
    let collapsedImage = null;
    if (mookImageToggle.attr("data-text") === SystemUtils.Localize("CPR.imagecollapse")) {
      mookImageToggle.attr("data-text", SystemUtils.Localize("CPR.imageexpand"));
      collapsedImage = true;
    } else {
      mookImageToggle.attr("data-text", SystemUtils.Localize("CPR.imagecollapse"));
      collapsedImage = false;
    }
    mookImageArea.toggleClass("mook-image-small-toggle");
    mookImageImg.toggleClass("hide");
    const actorData = duplicate(this.actor.data);
    actorData.flags.collapsedImage = collapsedImage;
    console.log(actorData);
    this.actor.update(actorData);
  }

  /** @override
  This method is called as a byproduct of a drag-and-drop listener provided by Foundry. (_onDrop)
  Foundry does not provide an easy way to look up an item that was just created via a drag-and-drop event.
  An itemId is in the enclosed data, but it is for the item that was dragged, and it changes when the
  (duplicate) owned item is created.
  */
  async _onDropItemCreate(itemData) {
    LOGGER.debugObject(itemData);
    const eqItem = itemData;
    eqItem.data.equipped = "equipped";
    if (eqItem.type === "cyberware") {
      if (eqItem.data.isFoundational) {
        eqItem.data.isInstalled = true;
      } else {
        const msg = `${SystemUtils.Localize("CPR.mookcyberwarewarning")}`;
        SystemUtils.DisplayMessage("warn", msg);
      }
    }
    return super._onDropItemCreate(eqItem);
  }

  /*
  _onDrop(event) {
    LOGGER.trace("_onDrop | CPRMookActorSheet | called.");
    const thing = super._onDrop(event);
    LOGGER.debugObject(thing);
    // auto-equip the item
    const dragData = JSON.parse(event.dataTransfer.getData("text/plain"));
    LOGGER.debugObject(dragData);
    const item = this.actor.getOwnedItem(dragData.id);
    LOGGER.debugObject(item);
    this._updateOwnedItemProp(item, "data.equipped", "equipped");
  }
  */
}
