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
      let chatOptions = this.ChatDataSetup(html);

      // These are things Warhammer had in their call that we didn't have
      // Looked at wfrp4e/modules/system/dice-wfrp4e.js 702:784, 760 is the call
      chatOptions.speaker = ChatMessage.getSpeaker();
      chatOptions["flags"] = { img: "systems/cyberpunk-red-core/icons/black_d10_1.png" };
      chatOptions["flags.data"] = {
        postData: data,
        template: template,
        rollMode: chatOptions.rollMode,
        title: "Some Roll Shit",
        hideData: game.user.isGM,
      };
      chatOptions["template"] = template;
      chatOptions["title"] = "A title";

      return ChatMessage.create(chatOptions, false);
    });
  }
}
