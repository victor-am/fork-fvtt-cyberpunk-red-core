/* eslint-disable class-methods-use-this */
/* eslint-disable no-undef */
/* global game */
import CPRChat from "../chat/cpr-chat.js";
import SystemUtils from "./cpr-systemUtils.js";

export default class CPRMacro {
  static async rollItemMacro(itemName, extraRollArgs = { skipPrompt: false, rollType: "attack" }) {
    const speaker = ChatMessage.getSpeaker();
    const extraData = extraRollArgs;
    let actor;
    if (speaker.token) actor = game.actors.tokens[speaker.token];
    if (!actor) actor = game.actors.get(speaker.actor);
    const item = actor ? actor.items.find((i) => i.name === itemName) : null;

    const displayName = actor === null ? "ERROR" : actor.name;
    if (!item) {
      SystemUtils.DisplayMessage("warn", `[${displayName}] ${SystemUtils.Localize("CPR.macro.itemMissing")} ${itemName}`);
      return;
    }

    const validRollTypes = ["skill", "attack", "damage", "aimed", "autofire", "suppressive"];
    let rollType;
    switch (item.data.type) {
      case "weapon": {
        rollType = extraData.rollType;
        break;
      }
      case "skill": {
        rollType = "skill";
        break;
      }
      default:
    }

    if (!validRollTypes.includes(rollType)) {
      SystemUtils.DisplayMessage("warn", `[${displayName}] ${SystemUtils.Localize("CPR.macro.invalidRollType")} ${rollType}`);
      return;
    }

    if (rollType === "damage") {
      extraData.damageType = actor.getFlag("cyberpunk-red-core", `firetype-${item.data._id}`);
    }

    let cprRoll = item.createRoll(rollType, actor, extraData);
    const event = {};
    event.ctrlKey = false;
    event.type = "macro";

    const fireModes = ["aimed", "autofire", "suppressive"];
    if (fireModes.includes(rollType)) {
      actor.setFlag("cyberpunk-red-core", `firetype-${item.data._id}`, rollType);
    }

    if (!extraData.skipPrompt) {
      const keepRolling = await cprRoll.handleRollDialog(event);
      if (!keepRolling) {
        return;
      }
    }

    cprRoll = await item.confirmRoll(cprRoll);
    await cprRoll.roll();
    cprRoll.entityData = speaker;
    cprRoll.entityData.item = item.id;

    CPRChat.RenderRollCard(cprRoll);

    // Need to figure out what we did here since this is gone??
    // actor.setPreviousRoll(cprRoll);
  }
}
