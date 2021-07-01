/* global mergeObject, $, duplicate */
import ConfirmPrompt from "../../dialog/cpr-confirmation-prompt.js";
import CPRActorSheet from "./cpr-actor-sheet.js";
import ModMookSkillPrompt from "../../dialog/cpr-mod-mook-skill-prompt.js";
import LOGGER from "../../utils/cpr-logger.js";
import SystemUtils from "../../utils/cpr-systemUtils.js";
import MookNamePrompt from "../../dialog/cpr-mook-name-prompt.js";

/**
 * Extend the basic CPRActorSheet. A lot of code is common between mooks and characters.
 *
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

  /**
   * Activate listeners for the sheet. This has to call super at the end to get additional
   * listners that are common between mooks and characters.
   *
   * @override
   * @param {Object} html - the DOM object
   */
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

  /**
   * Called when the edit-skills glyph (top right of the skills section on the sheet) is clicked. This
   * pops up the wizard for modifying mook skills quickly.
   *
   * @async
   * @callback
   * @private
   * @returns {null}
   */
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
      const updated = SystemUtils.Localize("CPR.updated");
      const to = SystemUtils.Localize("CPR.to");
      const msg = `${updated} ${formData.skillName} ${to} ${formData.skillLevel}`;
      SystemUtils.DisplayMessage("notify", msg);
      again = formData.again;
    }
  }

  /**
   * Called when a user clicks on the mook name in the sheet. Pops up a dialog to edit the name.
   *
   * @async
   * @callback
   * @private
   * @returns {bull}
   */
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

  /**
   * Show or hide the profile icon on the mook sheet when clicked.
   *
   * @callback
   * @private
   * @param {Object} event - event data such as a mouse click or key press
   */
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

  /**
   * Called when a user presses a key, but only does things if it was DEL. This is used in conjunction
   * with jQuery's focus() call, which is called on hover. That way, an html element is "selected" just
   * by hovering the mouse over. Then when DEL is pressed, we have a thing that can be deleted from the sheet
   * and the actor object underneath.
   *
   * @async
   * @callback
   * @private
   * @param {Object} event - event data such as a mouse click or key press
   */
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
              await this.actor.removeCyberware(itemId, foundationalId, true);
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
