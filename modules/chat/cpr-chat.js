/* eslint-disable no-undef */
/* global game, CONFIG, ChatMessage, renderTemplate */
import LOGGER from "../utils/cpr-logger.js";

export default class CPRChat {
  static ChatDataSetup(content, modeOverride, isRoll = false, forceWhisper) {
    const chatData = {
      user: game.user._id,
      rollMode: modeOverride || game.settings.get("core", "rollMode"),
      content,
    };

    if (isRoll) {
      chatData.sound = CONFIG.sounds.dice;
    }

    if (["gmroll", "blindroll"].includes(chatData.rollMode)) {
      chatData.whisper = ChatMessage.getWhisperRecipients("GM").map((u) => u.id);
    }

    if (chatData.rollMode === "blindroll") {
      chatData.blind = true;
    } else if (chatData.rollMode === "selfroll") {
      chatData.whisper = [game.user];
    }

    if (forceWhisper) {
      chatData.speaker = ChatMessage.getSpeaker();
      chatData.whisper = ChatMessage.getWhisperRecipients(forceWhisper);
    }

    return chatData;
  }

  static GetTemplate(rollType) {
    switch (rollType) {
      case "damage": {
        return "systems/cyberpunk-red-core/templates/chat/cpr-damage-rollcard.hbs";
      }
      case "deathsave": {
        return "systems/cyberpunk-red-core/templates/chat/cpr-deathsave-rollcard.hbs";
      }
      case "attack":
      case "stat":
      case "roleAbility":
      case "skill": {
        return "systems/cyberpunk-red-core/templates/chat/cpr-base-rollcard.hbs";
      }
      default: {
        return "systems/cyberpunk-red-core/templates/chat/cpr-base-rollcard.hbs";
      }
    }
  }

  static RenderRollCard(rollResult) {
    LOGGER.trace("RenderRollCard | Chat | Called.");
    const template = this.GetTemplate(rollResult.rollType);
    const data = duplicate(rollResult);
    return renderTemplate(
      template,
      data,
    ).then((html) => {
      const chatOptions = this.ChatDataSetup(html);
      if (rollResult.entityData !== undefined && rollResult.entityData !== null) {
        const actor = game.actors.filter((a) => a._id === rollResult.entityData.actor)[0];
        let alias = actor.name;
        if (rollResult.entityData.token !== null) {
          const token = game.actors.tokens[rollResult.entityData.token];
          alias = token.data.name;
        }
        chatOptions.speaker = { actor, alias };
      }
      return ChatMessage.create(chatOptions, false);
    });
  }
}
