/* eslint-disable no-shadow */
/* global renderTemplate FormDataExtended Dialog */
import LOGGER from "../utils/cpr-logger.js";
import SystemUtils from "../utils/cpr-systemUtils.js";

export default class SelectCompatibleAmmo {
  static async RenderPrompt(data) {
    const template = "systems/cyberpunk-red-core/templates/dialog/cpr-select-compatible-ammo-prompt.hbs";
    return new Promise((resolve, reject) => {
      renderTemplate(template, data).then((html) => {
        const _onCancel = () => {
          LOGGER.trace("_onCancel | Dialog SelectRolesPrompt | called.");
          reject(new Error("Promise rejected: Window Closed"));
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
          title: SystemUtils.Localize("CPR.dialog.selectCompatibleAmmo.title"),
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
          render: LOGGER.trace("confirm | Dialog SelectRolesPrompt | called."),
          close: () => {
            reject(new Error("Promise rejected: Window Closed"));
          },
        }).render(true);
      });
    });
  }
}
