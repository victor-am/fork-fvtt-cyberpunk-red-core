import LOGGER from "../utils/cpr-logger.js";
import SystemUtils from "../utils/cpr-systemUtils.js";

export default class SelectRolesPrompt {
  static async RenderPrompt(data) {
    const template = "systems/cyberpunk-red-core/templates/dialog/cpr-select-roles.hbs";
    return new Promise((resolve, reject) => {
      renderTemplate(template, data).then((html) => {
        const _onCancel = () => {
          LOGGER.trace("_onCancel | Dialog SelectRolesPrompt | called.");
          reject();
        };
        const _onConfirm = (html) => {
          LOGGER.trace("_onConfirm | Dialog SelectRolesPrompt | called.");
          const roleList = html.find("[name=\"selectedRoles\"");
          const selectedRoles = [];
          Object.keys(roleList).forEach((role) => {
            if (roleList[role].checked) {
              selectedRoles.push(roleList[role].value);
            }
          });
          resolve(selectedRoles);
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
