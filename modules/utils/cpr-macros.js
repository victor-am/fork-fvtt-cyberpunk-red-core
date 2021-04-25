/* eslint-disable class-methods-use-this */
/* eslint-disable no-undef */
/* global game, ui */
import CPRChat from "../chat/cpr-chat.js";

export default class CPRMacro {
  static async rollItemMacro(itemName, extraData = { skipPrompt: false, rollType: "attack" }) {
    const speaker = ChatMessage.getSpeaker();
    let actor;
    if (speaker.token) actor = game.actors.tokens[speaker.token];
    if (!actor) actor = game.actors.get(speaker.actor);
    const item = actor ? actor.items.find((i) => i.name === itemName) : null;

    const displayName = actor === null ? "ERROR" : actor.name;
    if (!item) return ui.notifications.warn(`[${displayName}] ${game.i18n.localize("CPR.macroitemmissing")} ${itemName}`);

    let rollType;
    switch (item.data.type) {
      case "weapon": {
        rollType = extraData.rollType === "attack" ? "attack" : "damage";
        if (item.data.data.isRanged) {
          rollType = extraData.rollType;
        }
        break;
      }
      case "skill": {
        rollType = "skill";
        break;
      }
      default:
    }
    let cprRoll = item.createRoll(rollType, actor, extraData);
    const event = {};
    event.ctrlKey = false;
    event.type = "macro";

    if (!extraData.skipPrompt) {
      await cprRoll.handleRollDialog(event);
    }

    cprRoll = await item.confirmRoll(cprRoll);
    await cprRoll.roll();
    cprRoll.entityData = speaker;
    CPRChat.RenderRollCard(cprRoll);

    // Need to figure out what we did here since this is gone??
    // actor.setPreviousRoll(cprRoll);
    return true;
  }
}
