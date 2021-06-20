/* global mergeObject, $, duplicate */
import ConfirmPrompt from "../../dialog/cpr-confirmation-prompt.js";
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
    const defaultWidth = 750;
    const defaultHeight = 500;
    return mergeObject(super.defaultOptions, {
      template: "systems/cyberpunk-red-core/templates/actor/mooks/cpr-mook-sheet.hbs",
      defaultWidth,
      defaultHeight,
      width: defaultWidth,
      height: defaultHeight,
    });
  }

  activateListeners(html) {
    LOGGER.trace("activateListeners | CPRMookActorSheet | Called.");
    super.activateListeners(html);
    html.find(".mod-mook-skill").click(() => this._modMookSkill());
    html.find(".change-mook-name").click(() => this._changeMookName());
    html.find(".mook-image-toggle").click((event) => this._expandMookImage(event));

    // handle the delete key
    // div elements need focus for the DEL key to work on them
    html.find(".deletable").hover((event) => $(event.currentTarget).focus());
    html.find(".deletable").keydown((event) => this._handleDelKey(event));
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
      const formData = await ModMookSkillPrompt.RenderPrompt({ skillList }).catch((err) => LOGGER.debug(err));
      if (formData === undefined) {
        return;
      }
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
    const formData = await MookNamePrompt.RenderPrompt(this.actor.data.name).catch((err) => LOGGER.debug(err));
    if (formData === undefined) {
      return;
    }
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
    this.actor.update(actorData);
  }

  async _handleDelKey(event) {
    LOGGER.trace("_handleDelKey | CPRActorSheet | Called.");
    LOGGER.debug(event.keyCode);
    if (event.keyCode === 46) {
      LOGGER.debug("DEL key was pressed");
      const itemId = $(event.currentTarget).attr("data-item-id");
      const item = this._getOwnedItem(itemId);
      switch (item.type) {
        case "skill": {
          item.setSkillLevel(0);
          item.setSkillMod(0);
          this._updateOwnedItem(item);
          break;
        }
        case "cyberware": {
          if (item.data.data.core === true) {
            SystemUtils.DisplayMessage("error", SystemUtils.Localize("CPR.cannotdeletecorecyberware"));
          } else {
            const foundationalId = $(event.currentTarget).attr("data-foundational-id");
            const dialogTitle = SystemUtils.Localize("CPR.removecyberwaredialogtitle");
            const dialogMessage = `${SystemUtils.Localize("CPR.removecyberwaredialogtext")} ${item.name}?`;
            const confirmRemove = await ConfirmPrompt.RenderPrompt(dialogTitle, dialogMessage);
            if (confirmRemove) {
              this.actor.removeCyberware(itemId, foundationalId, true);
              this._deleteOwnedItem(item, true);
            }
          }
          break;
        }
        default: {
          this._deleteOwnedItem(item);
          break;
        }
      }
    } else if (event.keyCode === 18) {
      LOGGER.debug("ALT key was pressed");
      $(".skill-name").hide();
    }
  }
}
