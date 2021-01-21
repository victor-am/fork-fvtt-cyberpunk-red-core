/* global renderTemplate, FormDataExtended, Dialog */
// TODO - Revist this method of dialog creation.

import LOGGER from "../utils/cpr-logger.js";

// TODO - Revist name of function.
const InstallCyberwarePrompt = async (data) => new Promise((resolve, reject) => {
  renderTemplate("systems/cyberpunk-red-core/templates/dialog/cpr-install-cyberware-prompt.hbs", data).then((html) => {
    /* eslint-disable no-shadow */
    const _onCancel = (html) => { // TODO fix no-shadow
      /* eslint-enable no-shadow */
      LOGGER.trace("_onCancel | Dialog VerifyRollPrompt | called.");
      reject();
    };

    /* eslint-disable no-shadow */
    const _onConfirm = (html) => { // TODO fix no-shadow
      /* eslint-enable no-shadow */
      LOGGER.trace("_onConfirm | Dialog VerifyRollPrompt | called.");
      const formData = new FormDataExtended(html.find("form")[0]).toObject();
      resolve(formData);
    };

    new Dialog({
      title: "Install Cyberware",
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
          label: "Install",
          /* eslint-disable no-shadow */
          callback: (html) => _onConfirm(html), // TODO fix no-shadow
          /* eslint-enable no-shadow */
        },
      },
      default: "confirm",
      render: LOGGER.trace("render | Dialog InstallCyberWare | Called."),
      close: () => {
        reject();
      },
    }).render(true);
  });
});

export default InstallCyberwarePrompt;
