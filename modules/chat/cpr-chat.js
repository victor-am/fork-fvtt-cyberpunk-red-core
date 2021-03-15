/* global game, CONFIG, ChatMessage, renderTemplate, duplicate */
import LOGGER from "../utils/cpr-logger.js";
import CPRRoll from "../rolls/cpr-rolls.js";
import SystemUtils from "../utils/cpr-systemUtils.js";

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
    cprRoll.criticalCard = cprRoll.wasCritical();
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
    const trimmedItem = item;
    const itemTemplate = "systems/cyberpunk-red-core/templates/item/cpr-item-roll-card.hbs";

    // trim strings so layout does not get too goofy
    const maxNameLen = 16;
    trimmedItem.trimName = item.name;
    if (trimmedItem.name === null || trimmedItem.trimName.length > maxNameLen) {
      trimmedItem.trimName = `${trimmedItem.trimName.slice(0, maxNameLen - 1)}…`;
    }
    const maxDescLen = 5000;
    trimmedItem.trimDesc = item.data.data.description.value;
    if (trimmedItem.trimDesc === null || trimmedItem.trimDesc.length === 0) {
      trimmedItem.trimDesc = "(No description)";
    } else if (trimmedItem.trimDesc.length > maxDescLen) {
      // TODO - this dangerously cuts through html code
      trimmedItem.trimDesc = `${trimmedItem.trimDesc.slice(0, maxDescLen - 1)}…`;
    }

    return renderTemplate(itemTemplate, trimmedItem).then((html) => {
      const chatOptions = this.ChatDataSetup(html);
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

  static async HandleRedCommand(data) {
    // First, let's see if we can figure out what was passed to /red
    const modifiers = /^[+-][0-9][0-9]*/;
    const dice = /[0-9][0-9]*d[0-9][0-9]*/;
    let formula = data.match(dice)[0];
    if (!formula) {
      formula = "1d10";
    }
    if (data.match(modifiers)) {
      const formulaModifiers = data.replace(formula, "");
      formula = `${formula}${formulaModifiers}`;
    }
    if (formula) {
      const cprRoll = new CPRRoll(SystemUtils.Localize("CPR.roll"), formula);
      await cprRoll.roll();
      this.RenderRollCard(cprRoll);
    }
  }
}
