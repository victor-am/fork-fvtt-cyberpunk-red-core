/* global game, CONFIG, ChatMessage, renderTemplate $ ui */
import LOGGER from "../utils/cpr-logger.js";
import { CPRRoll } from "../rolls/cpr-rolls.js";
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

  static async HandleCPRCommand(data) {
    LOGGER.trace("HandleCPRCommand | Chat | Called.");
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
      if (cprRoll.die !== "d6" && cprRoll.die !== "d10") {
        cprRoll.calculateCritical = false;
        cprRoll.die = "generic";
      }
      await cprRoll.roll();
      this.RenderRollCard(cprRoll);
    }
  }

  static async chatListeners(html) {
    LOGGER.trace("chatListeners | Chat | Called.");
    html.on("click", ".clickable", async (event) => {
      const clickAction = $(event.currentTarget).attr("data-action");

      switch (clickAction) {
        case "toggleVisibility": {
          const elementName = $(event.currentTarget).attr("data-visible-element");
          $(html).find(`.${elementName}`).toggleClass("hide");
          break;
        }
        case "rollDamage": {
          // This will let us click a damage link off of the attack card
          const rollType = "damage";
          const actorId = $(event.currentTarget).attr("data-actor-id");
          const itemId = $(event.currentTarget).attr("data-item-id");
          const actor = game.actors.find((a) => a._id === actorId);
          const item = actor ? actor.items.find((i) => i._id === itemId) : null;
          const displayName = actor === null ? "ERROR" : actor.name;
          if (!item) return ui.notifications.warn(`[${displayName}] ${game.i18n.localize("CPR.actormissingitem")} ${itemId}`);
          const cprRoll = item.createRoll(rollType, actor._id);

          await cprRoll.handleRollDialog(event);

          item.confirmRoll(rollType, cprRoll);
          await cprRoll.roll();
          CPRChat.RenderRollCard(cprRoll);

          break;
        }
        default: {
          LOGGER.warn(`No action defined for ${clickAction}`);
        }
      }
      return true;
    });
  }

  // This code cannot tell if the messageData is a roll because CPR never sets
  // roll information to chat messages. This is due to our Dice So Nice integration.
  static addMessageTags(html, messageData) {
    const timestampTag = html.find(".message-timestamp");
    const whisperTargets = messageData.message.whisper;
    const isBlind = messageData.message.blind || false;
    const isWhisper = whisperTargets?.length > 0 || false;
    const isSelf = isWhisper && whisperTargets.length === 1 && whisperTargets[0] === messageData.message.user;
    const indicatorElement = $("<span>");
    indicatorElement.addClass("chat-mode-indicator");

    // Inject tag to the left of the timestamp
    if (isBlind) {
      indicatorElement.text(SystemUtils.Localize("CPR.blind"));
      timestampTag.before(indicatorElement);
    } else if (isSelf) {
      indicatorElement.text(SystemUtils.Localize("CPR.self"));
      timestampTag.before(indicatorElement);
    } else if (isWhisper) {
      indicatorElement.text(SystemUtils.Localize("CPR.whisper"));
      timestampTag.before(indicatorElement);
    }
  }
}
