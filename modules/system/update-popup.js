/* eslint-disable class-methods-use-this */
/* global game, Application, mergeObject */
import LOGGER from "../utils/cpr-logger.js";
import SystemUtils from "../utils/cpr-systemUtils.js";

export default class UpdateScreen extends Application {
  static get defaultOptions() {
    LOGGER.trace("defaultOptions | UpdateScreen | Called.");
    const { title } = game.system.data;
    const { version } = game.system.data;
    return mergeObject(super.defaultOptions, {
      template: `systems/cyberpunk-red-core/templates/dialog/cpr-update-announcement.hbs`,
      resizable: true,
      width: 450,
      height: 636,
      title: `${title} - Version ${version} Upgrade`,
    });
  }

  async getData(options = {}) {
    LOGGER.trace("getData | UpdateScreen | Called.");
    const featureVideoLink = (typeof game.system.data.flags.featureVideoURL === "undefined") ? "" : game.system.data.flags.featureVideoURL;

    const releaseSpecificInstructions = `systems/cyberpunk-red-core/lang/release-notes/v${game.system.data.version}`;

    let { lang } = game.i18n;
    let response = await fetch(`${releaseSpecificInstructions}.${lang}`);

    if (response.status !== 200) {
      lang = "en";
      response = await fetch(`${releaseSpecificInstructions}.${lang}`);
    }

    const releaseInstructions = (response.status === 200) ? await response.text() : "";

    const data = {
      updateBanner: SystemUtils.Format("CPR.system.update.welcomeToSystem", { system: game.system.data.title }),
      releaseVersion: game.system.data.version,
      changelogInformation: SystemUtils.Format("CPR.system.update.changelogInformation"),
      featureVideoTitle: SystemUtils.Format("CPR.system.update.videoInformationTitle"),
      featureVideoInformation: SystemUtils.Format("CPR.system.update.videoInformation"),
      featureVideoLink,
      releaseInstructionsTitle: SystemUtils.Format("CPR.system.update.releaseInstructionsTitle"),
      releaseInstructions,
      HERE: SystemUtils.Format("CPR.system.update.here"),
    };
    return data;
  }

  static async RenderPopup() {
    LOGGER.trace("RenderPopup | UpdateScreen | Called.");
    const popup = new UpdateScreen();
    popup.render(true);
  }
}
