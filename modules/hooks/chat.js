/* eslint-disable no-undef */
/* global Hooks */
/* eslint no-unused-vars:1 */
import LOGGER from "../utils/cpr-logger.js";
import CPRRoll from "../rolls/cpr-rolls.js";

const chatPreHooks = () => {
  Hooks.on("renderChatMessage", async (app, html, msg) => {
    LOGGER.trace("renderChatMessage | chatHooks | Called.");
    // Do not display "Blind" chat cards to non-gm
    // Foundry doesn't support blind chat messages so
    // this is how we get around that.
    if (html.hasClass("blind") && !game.user.isGM) {
      html.find(".message-header").remove(); // Remove header so Foundry does not attempt to update its timestamp
      html.html("").css("display", "none");
    }
    CPRRoll.chatListeners(html);
  });
};

export default chatPreHooks;
