/* eslint-disable no-shadow */
/* global renderTemplate, FormDataExtended, Dialog */
// TODO - Revist this method of dialog creation.
import SystemUtils from "../utils/cpr-systemUtils.js";
import LOGGER from "../utils/cpr-logger.js";

export default class CyberwareInstallPrompt {
  // TODO - Revist name of function.
  static async RenderPrompt(data) {
    LOGGER.trace("RenderPrompt | CyberwareInstallPrompt | called.");
    // setup
    return new Promise((resolve, reject) => {
      const template = "systems/cyberpunk-red-core/templates/dialog/cpr-install-cyberware-prompt.hbs";
      renderTemplate(template, data).then((html) => {
        const _onCancel = () => {
          LOGGER.trace("_onCancel | Dialog CyberwareInstallPrompt | called.");
          reject(new Error("Promise rejected: Window Closed"));
        };
        const _onConfirm = (html) => {
          LOGGER.trace("_onConfirm | Dialog CyberwareInstallPrompt | called.");
          const formData = new FormDataExtended(html.find("form")[0]).toObject();
          resolve(formData);
        };
        new Dialog({
          title: SystemUtils.Localize("CPR.dialog.installCyberware.title"),
          content: html,
          buttons: {
            cancel: {
              icon: "<i class=\"fas fa-times\"></i>",
              label: SystemUtils.Localize("CPR.cancel"),
              callback: (html) => _onCancel(html), // TODO fix no-shadow
            },
            confirm: {
              icon: "<i class=\"fas fa-check\"></i>",
              label: SystemUtils.Localize("CPR.install"),
              callback: (html) => _onConfirm(html), // TODO fix no-shadow
            },
          },
          default: "confirm",
          render: LOGGER.trace("render | Dialog CyberwareInstallPrompt | Called."),
          close: () => {
            reject(new Error("Promise rejected: Window Closed"));
          },
        }).render(true);
      });
    });
  }
}
