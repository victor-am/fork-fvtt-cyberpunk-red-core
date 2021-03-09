/* global Hooks */
/* eslint no-unused-vars:1 */
import LOGGER from "../utils/cpr-logger.js";
import { enablePauseAnimation } from "../system/pause-animation.js";

const uiHooks = () => {
  Hooks.on("renderPause", () => {
    LOGGER.trace("\"pauseGame | uiHooks | Called.\"");
    enablePauseAnimation();
  });
};

export default uiHooks;
