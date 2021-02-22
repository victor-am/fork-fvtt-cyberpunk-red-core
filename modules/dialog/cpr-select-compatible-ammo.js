/* eslint-disable no-shadow */
/* eslint-disable no-undef */
import LOGGER from "../utils/cpr-logger.js";
import SystemUtils from "../utils/cpr-systemUtils.js";

export default class SelectRolesPrompt {
  static async RenderPrompt(data) {
    const template = "systems/cyberpunk-red-core/templates/dialog/cpr-select-compatible-ammo-prompt.hbs";
    return new Promise((resolve, reject) => {
      renderTemplate(template, data).then((html) => {
        const _onCancel = () => {
          LOGGER.trace("_onCancel | Dialog SelectRolesPrompt | called.");
          reject();
        };
        const _onConfirm = (html) => {
          LOGGER.trace("_onConfirm | Dialog SelectRolesPrompt | called.");
          const ammoList = html.find("[name=\"selectedAmmo\"");
          const selectedAmmo = [];
          const formData = new FormDataExtended(html.find("form")[0]).toObject();
          Object.keys(ammoList).forEach((ammo) => {
            if (ammoList[ammo].checked) {
              selectedAmmo.push(ammoList[ammo].value);
            }
          });
          formData.selectedAmmo = selectedAmmo;
          resolve(formData);
        };
        new Dialog({
          title: SystemUtils.Localize("CPR.selectroleprompttitle"),
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
          render: LOGGER.trace("confirm | Dialog SelectRolesPrompt | called."),
          close: () => {
            reject();
          },
        }).render(true);
      });
    });
  }
}
