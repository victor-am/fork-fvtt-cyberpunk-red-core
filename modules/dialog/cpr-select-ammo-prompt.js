/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
/* eslint-disable no-shadow */
/* eslint-disable class-methods-use-this */
/* global renderTemplate, FormDataExtended, Dialog */
import LOGGER from "../utils/cpr-logger.js";

// TODO - Adopt new prompt pattern
const SelectAmmoPrompt = async (dialogData) => {
  LOGGER.trace("_loadWeapon | Dialog SelectAmmoForWeapon | called.");
  return new Promise((resolve) => {
    renderTemplate("systems/cyberpunk-red-core/templates/dialog/cpr-select-ammo-prompt.hbs", dialogData).then((html) => {
      /* eslint-disable no-shadow */
      const _onCancel = (html) => { // TODO fix no-shadow
        /* eslint-enable no-shadow */
        LOGGER.trace("_loadWeapon | Dialog SelectAmmoForWeapon | called.");
        dialogData.selectedAmmo = "abort";
      };

      /* eslint-disable no-shadow */
      const _onConfirm = (html) => { // TODO fix no-shadow
        /* eslint-enable no-shadow */
        LOGGER.trace("_loadWeapon | Dialog SelectAmmoForWeapon | called.");
        const rButtons = html.find("[name=\"selectedAmmo\"");
        Object.keys(rButtons).forEach((rb) => {
          if (rButtons[rb].checked) {
            dialogData.selectedAmmo = rButtons[rb].value;
          }
        });
      };

      new Dialog({
        title: "Select Ammunition",
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
        render: LOGGER.trace("confirm | Dialog SelectAmmoForWeapon | called."),
        close: () => {
          resolve(dialogData);
        },
      }).render(true);
    });
  });
};

export default SelectAmmoPrompt;
