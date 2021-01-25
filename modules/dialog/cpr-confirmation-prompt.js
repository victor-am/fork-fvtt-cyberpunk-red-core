/* global renderTemplate, FormDataExtended, Dialog */

import LOGGER from "../utils/cpr-logger.js";

// Make this generic to be used as a Cancel/Confirm for any action (delete item, etc)
const ConfirmationPrompt = async (data) => new Promise((resolve, reject) => {
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

export default ConfirmationPrompt;
