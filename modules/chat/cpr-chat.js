/* global game, CONFIG, ChatMessage, renderTemplate, duplicate */
import LOGGER from "../utils/cpr-logger.js";
import { CPRRoll } from "../rolls/cpr-rolls.js";

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

  static async HandleCPRCommand(data) {
    // First, let's see if we can figure out what was passed to /red
    // Right now, we will assume it is a roll
    const modifiers = /[+-][0-9][0-9]*/;
    const dice = /[0-9][0-9]*d[0-9][0-9]*/;
    let formula = "1d10";
    if (data.match(dice)) {
      // eslint-disable-next-line prefer-destructuring
      formula = data.match(dice)[0];
    }
    if (data.match(modifiers)) {
      const formulaModifiers = data.replace(formula, "");
      formula = `${formula}${formulaModifiers}`;
    }
    if (formula) {
      const cprRoll = new CPRRoll(game.i18n.localize("CPR.roll"), formula);
      await cprRoll.roll();
      this.RenderRollCard(cprRoll);
    }
  }

  static async chatListeners(html) {
    html.on("click", ".clickable", async event => {
      const clickAction = $(event.currentTarget).attr("data-action");

      switch (clickAction) {
        case "hide": {
          const elementName = $(event.currentTarget).attr("data-hide-element");
          const currentText = event.currentTarget.innerText;
          const showDetails = `${game.i18n.localize("CPR.show")} ${game.i18n.localize("CPR.details")}`;
          const hideDetails = `${game.i18n.localize("CPR.hide")} ${game.i18n.localize("CPR.details")}`;
          event.currentTarget.innerText = currentText === showDetails ? hideDetails : showDetails;
          $(html).find(`.${elementName}`).toggleClass("hide");
          break;
        }
        case "rollDamage": {
          console.log(rollDamage);
          break;
        }
        default:
      }
    });
  }
}
