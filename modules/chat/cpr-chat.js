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

  static RenderRollCard(rollResult) {
    LOGGER.trace("RenderRollCard | Chat | Called.");
    return renderTemplate(
      "systems/cyberpunk-red-core/templates/chat/cpr-rollcard.hbs",
      rollResult,
    ).then((html) => {
      const chatOptions = this.ChatDataSetup(html);
      return ChatMessage.create(chatOptions, false);
    });
  }
}
