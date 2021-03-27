/* global Hooks game */
import LOGGER from "../utils/cpr-logger.js";
import CPRChat from "../chat/cpr-chat.js";

const chatHooks = () => {
  // eslint-disable-next-line no-unused-vars
  Hooks.on("renderChatMessage", async (app, html, msg) => {
    LOGGER.trace("renderChatMessage | chatHooks | Called.");
    // Do not display "Blind" chat cards to non-gm
    // Foundry doesn't support blind chat messages so
    // this is how we get around that.
    if (html.hasClass("blind") && !game.user.isGM) {
      html.find(".message-header").remove(); // Remove header so Foundry does not attempt to update its timestamp
      html.html("").css("display", "none");
    }
    CPRChat.chatListeners(html);
    CPRChat.injectMessageTag(html, msg);
    CPRChat.injectWhisperParticipants(html, msg);
  });

  // for now, we intentionally do not use log (ChatLog) or data (ChatData)
  // eslint-disable-next-line no-unused-vars
  Hooks.on("chatMessage", (log, message, data) => {
    LOGGER.trace("chatMessage | chatHooks | Called.");
    if (message !== undefined && message.startsWith("/red")) {
      const fragment = message.slice(4);
      CPRChat.HandleCPRCommand(fragment);
      // do not continue further processing of the ChatMessage
      return false;
    }
    // permit Foundry to display the chat message we caught as-is
    return true;
  });
};

export default chatHooks;
