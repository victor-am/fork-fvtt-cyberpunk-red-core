/* global ActorSheet mergeObject $ */
import CPRChat from "../../chat/cpr-chat.js";
import LOGGER from "../../utils/cpr-logger.js";

/**
 * Implement the Black-ICE sheet.
 * @extends {CPRActorSheet}
 */
export default class CPRBlackIceActorSheet extends ActorSheet {
  /** @override */
  static get defaultOptions() {
    LOGGER.trace("defaultOptions | CPRBlackIceActorSheet | Called.");
    return mergeObject(super.defaultOptions, {
      template: "systems/cyberpunk-red-core/templates/actor/black-ice/cpr-black-ice-sheet.hbs",
      width: 745,
      height: 212,
    });
  }

  /** @override */
  activateListeners(html) {
    html.find(".rollable").click((event) => this._onRoll(event));
    super.activateListeners(html);
  }

  /* -------------------------------------------- */
  //  INTERNAL METHODS BELOW HERE
  /* -------------------------------------------- */

  async _onRoll(event) {
    LOGGER.trace("_onRoll | CPRBlackIceActorSheet | Called.");
    const rollName = $(event.currentTarget).attr("data-roll-title");
    const cprRoll = this.actor.createStatRoll(rollName);

    await cprRoll.handleRollDialog(event);
    await cprRoll.roll();

    // output to chat
    const token = this.token === null ? null : this.token.data._id;
    cprRoll.entityData = { actor: this.actor._id, token };
    CPRChat.RenderRollCard(cprRoll);
  }
}
