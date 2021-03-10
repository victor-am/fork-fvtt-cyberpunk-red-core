/* eslint-disable class-methods-use-this */
/* eslint-disable no-undef */
/* global game, ui */
import VerifyRoll from "../dialog/cpr-verify-roll-prompt.js";
import LOGGER from "./cpr-logger.js";
import CPRChat from "../chat/cpr-chat.js";

export default class CPRSystemUtils {
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

  static async GetCoreSkills() {
    LOGGER.trace("CPRSystemUtils GetCoreSkills | CPRSystemUtils | called.");
    // grab basic skills from compendium
    const pack = game.packs.get("cyberpunk-red-core.skills");
    // put into basickSkills array
    const content = await pack.getContent();
    return content;
  }

  static async GetCoreCyberware() {
    LOGGER.trace("CPRSystemUtils GetCoreCyberware | CPRSystemUtils | called.");
    // grab basic skills from compendium
    const pack = game.packs.get("cyberpunk-red-core.cyberware");
    // put into basickSkills array
    const content = await pack.getContent();
    return content;
  }

  static async DisplayMessage(msgType, msg) {
    const localizedMessage = game.i18n.localize(msg);
    switch (msgType) {
      case "warn":
        ui.notifications.warn(localizedMessage);
        break;
      case "error":
        ui.notifications.error(localizedMessage);
        break;
      case "notify":
        ui.notifications.notify(localizedMessage);
        break;
      default:
    }
  }

  static Localize(string) {
    return game.i18n.localize(string);
  }

  static async rollItemMacro(itemName, extraData) {
    const speaker = ChatMessage.getSpeaker();
    let actor;
    if (speaker.token) actor = game.actors.tokens[speaker.token];
    if (!actor) actor = game.actors.get(speaker.actor);
    const item = actor ? actor.items.find((i) => i.name === itemName) : null;

    if (!item) return ui.notifications.warn(`[${actor.name}] ${game.i18n.localize("CPR.macroitemmissing")} ${itemName}`);

    let rollType;
    switch (item.data.type) {
      case "weapon": {
        rollType = "attack";
        break;
      }
      case "skill": {
        rollType = "skill";
        break;
      }
      default:
    }
    const cprRoll = item.createRoll(rollType, actor._id);
    const event = {};
    event.ctlKey = false;

    await this.handleRollDialog(event, cprRoll);
    item.confirmRoll(rollType, cprRoll);
    await cprRoll.roll();
    CPRChat.RenderRollCard(cprRoll);

    actor.setPreviousRoll(cprRoll);
    return true;
  }
}
