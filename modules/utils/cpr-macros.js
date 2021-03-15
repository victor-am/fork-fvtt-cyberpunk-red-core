/* eslint-disable class-methods-use-this */
/* eslint-disable no-undef */
/* global game, ui */
import VerifyRoll from "../dialog/cpr-verify-roll-prompt.js";
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
    const cprRoll = item.createRoll(rollType, actor._id, extraData);
    const event = {};
    event.ctlKey = false;

    if (!extraData.skipPrompt) {
      await this.handleRollDialog(event, cprRoll);
    }

    item.confirmRoll(rollType, cprRoll);
    await cprRoll.roll();
    CPRChat.RenderRollCard(cprRoll);

    actor.setPreviousRoll(cprRoll);
    return true;
  }

  static async handleRollDialog(event, cprRoll) {
    // Handle skipping of the user verification step
    let skipDialog = event.ctrlKey;

    const ctrlSetting = game.settings.get("cyberpunk-red-core", "invertRollCtrlFunction");
    skipDialog = ctrlSetting ? skipDialog : !skipDialog;

    if (skipDialog) {
      const formData = await VerifyRoll.RenderPrompt(cprRoll);
      mergeObject(cprRoll, formData, { overwrite: true });
    }
  }
}
