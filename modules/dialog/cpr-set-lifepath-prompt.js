/* eslint-disable no-shadow */
/* global Dialog renderTemplate FormDataExtended */
import LOGGER from "../utils/cpr-logger.js";
import SystemUtils from "../utils/cpr-systemUtils.js";

export default class SetLifepathPrompt {
  static async RenderPrompt(data) {
    LOGGER.trace("RenderPrompt | SetLifepathPrompt | called.");
    const template = "systems/cyberpunk-red-core/templates/dialog/cpr-set-lifepath-prompt.hbs";
    return new Promise((resolve, reject) => {
      renderTemplate(template, data).then((html) => {
        const _onCancel = () => {
          LOGGER.trace("_onCancel | Dialog SetLifepathPrompt | called.");
          reject(new Error("Promise rejected: Window Closed"));
        };
        const _onConfirm = (html) => {
          LOGGER.trace("_onConfirm | Dialog SetLifepathPrompt | called.");
          const formData = new FormDataExtended(html.find("form")[0]).toObject();
          resolve(formData);
        };
        new Dialog({
          title: SystemUtils.Localize("CPR.dialog.setLifepath.title"),
          content: html,
          buttons: {
            cancel: {
              icon: "<i class=\"fas fa-times\"></i>",
              label: SystemUtils.Localize("CPR.dialog.common.cancel"),
              callback: (html) => _onCancel(html), // TODO fix no-shadow
            },
            confirm: {
              icon: "<i class=\"fas fa-check\"></i>",
              label: SystemUtils.Localize("CPR.dialog.common.confirm"),
              callback: (html) => _onConfirm(html), // TODO fix no-shadow
            },
          },
          default: "confirm",
          render: LOGGER.trace("confirm | Dialog SetLifepathPrompt | called."),
          close: () => {
            reject(new Error("Promise rejected: Window Closed"));
          },
        }).render(true);
      });
    });
  }
}
