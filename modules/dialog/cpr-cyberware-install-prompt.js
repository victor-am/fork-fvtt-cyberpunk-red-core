/* eslint-disable no-shadow */
/* global renderTemplate, FormDataExtended, Dialog game */
// TODO - Revist this method of dialog creation.

import LOGGER from "../utils/cpr-logger.js";

export default class CyberwareInstallPrompt {
  // TODO - Revist name of function.
  static async RenderPrompt(data) {
    // setup
    return new Promise((resolve, reject) => {
      const template = "systems/cyberpunk-red-core/templates/dialog/cpr-install-cyberware-prompt.hbs";
      renderTemplate(template, data).then((html) => {
        const _onCancel = () => {
          LOGGER.trace("_onCancel | Dialog CyberwareInstallPrompt | called.");
          reject();
        };
        const _onConfirm = (html) => {
          LOGGER.trace("_onConfirm | Dialog CyberwareInstallPrompt | called.");
          const formData = new FormDataExtended(html.find("form")[0]).toObject();
          resolve(formData);
        };
        new Dialog({
          title: game.i18n.localize("CPR.installcyberwaredialogtitle"),
          content: html,
          buttons: {
            cancel: {
              icon: "<i class=\"fas fa-times\"></i>",
              label: "Cancel",
              callback: (html) => _onCancel(html), // TODO fix no-shadow
            },
            confirm: {
              icon: "<i class=\"fas fa-check\"></i>",
              label: "Install",
              callback: (html) => _onConfirm(html), // TODO fix no-shadow
            },
          },
          default: "confirm",
          render: LOGGER.trace("render | Dialog CyberwareInstallPrompt | Called."),
          close: () => {
            reject();
          },
        }).render(true);
      });
    });
  }
}
