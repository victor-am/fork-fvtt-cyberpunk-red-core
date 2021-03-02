/* eslint-disable no-shadow */
/* eslint-disable no-undef */
import LOGGER from "../utils/cpr-logger.js";
import SystemUtils from "../utils/cpr-systemUtils.js";

export default class SetLifepathPrompt {
  static async RenderPrompt(data) {
    const template = "systems/cyberpunk-red-core/templates/dialog/cpr-critical-injury-prompt.hbs";
    return new Promise((resolve, reject) => {
      renderTemplate(template, data).then((html) => {
        const _onCancel = () => {
          LOGGER.trace("_onCancel | Dialog SetLifepathPrompt | called.");
          reject();
        };
        const _onConfirm = (html) => {
          LOGGER.trace("_onConfirm | Dialog SetLifepathPrompt | called.");
          const formData = new FormDataExtended(html.find("form")[0]).toObject();
          resolve(formData);
        };
        new Dialog({
          title: SystemUtils.Localize("CPR.setlifepathtitle"),
          content: html,
          buttons: {
            cancel: {
              icon: "<i class=\"fas fa-times\"></i>",
              label: "Cancel",
              /* eslint-disable no-shadow */
              callback: (html) => _onCancel(html), // TODO fix no-shadow
              /* eslint-enable no-shadow */
            },
            confirm: {
              icon: "<i class=\"fas fa-check\"></i>",
              label: "Confirm",
              /* eslint-disable no-shadow */
              callback: (html) => _onConfirm(html), // TODO fix no-shadow
              /* eslint-enable no-shadow */
            },
          },
          default: "confirm",
          render: LOGGER.trace("confirm | Dialog SetLifepathPrompt | called."),
          close: () => {
            reject();
          },
        }).render(true);
      });
    });
  }
}
