/* eslint-disable no-shadow */
/* global renderTemplate Dialog FormDataExtended */
import LOGGER from "../utils/cpr-logger.js";
import SystemUtils from "../utils/cpr-systemUtils.js";

export default class SelectItemUpgradePrompt {
  static async RenderPrompt(data) {
    LOGGER.trace("RenderPrompt | SelectItemUpgradePrompt | called.");
    const template = "systems/cyberpunk-red-core/templates/dialog/cpr-select-item-upgrade-prompt.hbs";
    return new Promise((resolve, reject) => {
      renderTemplate(template, data).then((html) => {
        const _onCancel = () => {
          LOGGER.trace("_onCancel | Dialog SelectItemUpgradePrompt | called.");
          reject(new Error("Promise rejected: Window Closed"));
        };
        const _onConfirm = (html) => {
          LOGGER.trace("_onConfirm | Dialog SelectItemUpgradePrompt | called.");
          const upgradeList = html.find("[name=\"selectedUpgrade\"");
          const selectedUpgrades = [];
          const formData = new FormDataExtended(html.find("form")[0]).toObject();
          Object.keys(upgradeList).forEach((upgrade) => {
            if (upgradeList[upgrade].checked) {
              selectedUpgrades.push(upgradeList[upgrade].value);
            }
          });
          formData.selectedUpgradeIds = selectedUpgrades;
          resolve(formData);
        };
        new Dialog({
          title: SystemUtils.Localize("CPR.dialog.selectItemUpgrades.selectItemUpgrades"),
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
          render: LOGGER.trace("confirm | Dialog SelectItemUpgradePrompt | called."),
          close: () => {
            reject(new Error("Promise rejected: Window Closed"));
          },
        }).render(true);
      });
    });
  }
}