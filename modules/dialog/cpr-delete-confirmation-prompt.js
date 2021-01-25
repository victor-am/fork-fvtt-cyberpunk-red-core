/* global renderTemplate, FormDataExtended, Dialog */

import LOGGER from "../utils/cpr-logger.js";

// Make this generic to be used as a Cancel/Confirm for any action (delete item, etc)
const DeleteConfirmationPrompt = async (data) => new Promise((resolve, reject) => {
  renderTemplate("systems/cyberpunk-red-core/templates/dialog/cpr-confirmation-prompt.hbs", data).then((html) => {
    /* eslint-disable no-shadow */
    const _onCancel = (html) => { // TODO fix no-shadow
      /* eslint-enable no-shadow */
      LOGGER.trace("_onCancel | Dialog Confirmation Prompt | called.");
      reject(html);
    };

    /* eslint-disable no-shadow */
    const _onConfirm = (html) => { // TODO fix no-shadow
      /* eslint-enable no-shadow */
      LOGGER.trace("_onConfirm | Dialog ConfirmationPrompt | called.");
      resolve(html);
    };

    new Dialog({
      title: data.promptTitle,
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
      default: "cancel",
      render: LOGGER.trace("render | Dialog ConfirmationPrompt | Called."),
      close: () => {
        reject();
      },
    }).render(true);
  });
});

export default class DeleteConfirmationPrompt {

  // INFO - Needless getter to show a more simple of example of complex dialogs following existing patterns
  static GetTemplate() {
    return "systems/cyberpunk-red-core/templates/dialog/cpr-confirmation-prompt.hbs";
  }

  static async RenderVerifyRollPrompt(item) {
    const template = this.GetTemplate();
    const data = duplicate(item);
    return new Promise((resolve, reject) => {
      renderTemplate(template, data).then((html) => {
        const _onCancel = () => {
          LOGGER.trace("_onCancel | Dialog VerifyRollPrompt | called.");
          reject();
        };
        const _onConfirm = (html) => {
          LOGGER.trace("_onConfirm | Dialog VerifyRollPrompt | called.");
          resolve(formData);
        };
        new Dialog({
          title: "Are you sure?",
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
          render: LOGGER.trace("confirm | Dialog VerifyRollPrompt | called."),
          close: () => {
            reject();
          },
        }).render(true);
      });
    });
  }
}