import { CPRActorSheet } from "./cpr-actor-sheet.js";

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class CPRCharacterActorSheet extends CPRActorSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      template: "systems/cyberpunk-red-core/templates/actor/cpr-character-sheet.html",
      width: 600,
      height: 600,
    });
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
    const data = super.getData();
    return data;
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if ( !this.options.editable ) return;
  }

  /* -------------------------------------------- */

  /**
   * Listen for roll buttons on items.
   * @param {MouseEvent} event    The originating left click event
   */
  _onItemRoll(event) {
    // let button = $(event.currentTarget);
    // let r = new Roll(button.data('roll'), this.actor.getRollData());
    // const li = button.parents(".item");
    // const item = this.actor.getOwnedItem(li.data("itemId"));
    // r.roll().toMessage({
    //   user: game.user._id,
    //   speaker: ChatMessage.getSpeaker({ actor: this.actor }),
    //   flavor: `<h2>${item.name}</h2><h3>${button.text()}</h3>`
    // });
  }

  /* -------------------------------------------- */

  /** @override */
  _updateObject(event, formData) {
    // formData = EntitySheetHelper.updateAttributes(formData, this);
    // formData = EntitySheetHelper.updateGroups(formData, this);
    // return this.object.update(formData);
  }

}
