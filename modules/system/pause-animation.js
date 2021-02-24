/* eslint-disable import/prefer-default-export */
/* eslint-env jquery */
/* global game, loadTemplates */
import LOGGER from "../utils/cpr-logger.js";

export function enablePauseAnimation() {
  const setting = game.settings.get(
    "cyberpunk-red-core", "enablePauseAnimation",
  );

  if (setting) {
    LOGGER.log("Enabling pause animation");
    $("#pause h3").attr("class", "pause-glitch");
    $("#pause img").attr("class", "pause-image");
  }
}
