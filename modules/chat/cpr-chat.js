/* global game, CONFIG, ChatMessage, renderTemplate, duplicate */
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

  static RenderRollCard(cprRoll) {
    LOGGER.trace("RenderRollCard | Chat | Called.");
    return renderTemplate(cprRoll.rollCard, cprRoll).then((html) => {
      const chatOptions = this.ChatDataSetup(html);
      if (cprRoll.entityData !== undefined && cprRoll.entityData !== null) {
        const actor = game.actors.filter((a) => a._id === cprRoll.entityData.actor)[0];
        let alias = actor.name;
        if (cprRoll.entityData.token !== null) {
          const token = game.actors.tokens[cprRoll.entityData.token];
          if (token !== undefined) {
            alias = token.data.name;
          }
        }
        chatOptions.speaker = { actor, alias };
      }
      return ChatMessage.create(chatOptions, false);
    });
  }

  static RenderItemCard(item) {
    LOGGER.trace("RenderItemCard | Chat | Called.");
    return renderTemplate(item.itemCard, item).then((html) => {
      const chatOptions = this.ChatDataSetup(html);
      // TODO: confirm this conditional is needed
      if (item.entityData !== undefined && item.entityData !== null) {
        const actor = game.actors.filter((a) => a._id === item.entityData.actor)[0];
        let alias = actor.name;
        if (item.entityData.token !== null) {
          const token = game.actors.tokens[item.entityData.token];
          if (token !== undefined) {
            alias = token.data.name;
          }
        }
        chatOptions.speaker = { actor, alias };
      }
      return ChatMessage.create(chatOptions, false);
    });
  }
}
