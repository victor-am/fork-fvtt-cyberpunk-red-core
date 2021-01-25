/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
/* eslint-disable no-shadow */
/* eslint-disable class-methods-use-this */
/* global renderTemplate, FormDataExtended, Dialog */

import LOGGER from "../utils/cpr-logger.js";

// Make this generic to be used as a Cancel/Confirm for any action (delete item, etc
export default class DeleteConfirmationPrompt {
  // INFO - ConfirmPrompt is a generic prompt to display on confirming an action.
  // Based on type of action, setup data to display based on given input.
  // Call to RenderPrompt should take one object as input, based on input type, prepare template and titles...
  static async RenderPrompt() {
    const template = "systems/cyberpunk-red-core/templates/dialog/cpr-confirmation-prompt.hbs";
    return new Promise((resolve, reject) => {
      renderTemplate(template).then((html) => {
        const _onCancel = () => {
          LOGGER.trace("_onCancel | Dialog VerifyRollPrompt | called.");
          resolve(false);
        };
        const _onConfirm = () => {
          LOGGER.trace("_onConfirm | Dialog VerifyRollPrompt | called.");
          resolve(true);
        };
        new Dialog({
          title: game.i18n.localize("CPR.deleteconfirmation"),
          content: html,
          buttons: {
            cancel: {
              icon: "<i class=\"fas fa-times\"></i>",
              label: "Cancel",
              /* eslint-disable no-shadow */
              callback: () => _onCancel(),
            },
            confirm: {
              icon: "<i class=\"fas fa-check\"></i>",
              label: "Confirm",
              /* eslint-disable no-shadow */
              callback: () => _onConfirm(),
            },
          },
          default: "cancel",
          render: LOGGER.trace("confirm | Dialog VerifyRollPrompt | called."),
          close: () => {
            reject();
          },
        }).render(true);
      });
    });
  }
}
