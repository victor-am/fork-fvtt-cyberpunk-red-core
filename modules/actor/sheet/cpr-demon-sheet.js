/* global mergeObject ActorSheet $ */
import CPRChat from "../../chat/cpr-chat.js";
import LOGGER from "../../utils/cpr-logger.js";

/**
 * Implement the sheet for demons.
 * @extends {CPRActorSheet}
 */
export default class CPRDemonActorSheet extends ActorSheet {
  /** @override */
  static get defaultOptions() {
    LOGGER.trace("defaultOptions | CPRDemonActorSheet | Called.");
    return mergeObject(super.defaultOptions, {
      template: "systems/cyberpunk-red-core/templates/actor/cpr-demon-sheet.hbs",
      width: 630,
      height: 205,
    });
  }

  /** @override */
  activateListeners(html) {
    LOGGER.trace("activateListeners | CPRDemonActorSheet | Called.");
    html.find(".rollable").click((event) => this._onRoll(event));
    super.activateListeners(html);
  }

  /* -------------------------------------------- */
  //  INTERNAL METHODS BELOW HERE
  /* -------------------------------------------- */

  async _onRoll(event) {
    LOGGER.trace("_onRoll | CPRDemonActorSheet | Called.");
    const rollName = $(event.currentTarget).attr("data-roll-title");
    const cprRoll = this.actor.createStatRoll(rollName);

    const keepRolling = await cprRoll.handleRollDialog(event);
    if (!keepRolling) {
      return;
    }
    await cprRoll.roll();

    // output to chat
    const token = this.token === null ? null : this.token.data._id;
    cprRoll.entityData = { actor: this.actor.id, token };
    CPRChat.RenderRollCard(cprRoll);
  }
}
