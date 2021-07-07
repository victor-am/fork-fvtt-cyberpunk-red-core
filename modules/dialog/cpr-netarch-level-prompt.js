/* eslint-disable no-shadow */
/* global Dialog renderTemplate FormDataExtended */
import LOGGER from "../utils/cpr-logger.js";
import SystemUtils from "../utils/cpr-systemUtils.js";

export default class NetarchLevelPrompt {
  static async RenderPrompt(data) {
    const template = "systems/cyberpunk-red-core/templates/dialog/cpr-netarch-level-prompt.hbs";
    return new Promise((resolve, reject) => {
      renderTemplate(template, data).then((html) => {
        const _onCancel = () => {
          LOGGER.trace("_onCancel | Dialog NetarchLevelPrompt | called.");
          reject(new Error("Promise rejected: Window Closed"));
        };
        const _onConfirm = (html) => {
          LOGGER.trace("_onConfirm | Dialog NetarchLevelPrompt | called.");
          const formData = new FormDataExtended(html.find("form")[0]).toObject();
          resolve(formData);
        };
        new Dialog({
          title: SystemUtils.Localize("CPR.dialog.netArchitectureNewFloor.title"),
          content: html,
          buttons: {
            cancel: {
              icon: "<i class=\"fas fa-times\"></i>",
              label: "Cancel",
              callback: (html) => _onCancel(html), // TODO fix no-shadow
            },
            confirm: {
              icon: "<i class=\"fas fa-check\"></i>",
              label: "Confirm",
              callback: (html) => _onConfirm(html), // TODO fix no-shadow
            },
          },
          default: "confirm",
          render: LOGGER.trace("confirm | Dialog NetarchLevelPrompt | called."),
          close: () => {
            reject(new Error("Promise rejected: Window Closed"));
          },
        }).render(true);
      });
    });
  }
}
