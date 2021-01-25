/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
/* eslint-disable no-shadow */
/* eslint-disable class-methods-use-this */
/* global renderTemplate, FormDataExtended, Dialog */
// TODO - Finish Refactor, See cyberware-install-prompt.js

import LOGGER from "../utils/cpr-logger.js";

export default class VerifyRollPrompt {
  static GetVerifyRollTemplate(rollType) {
    switch (rollType) {
      case "damage": {
        return "systems/cyberpunk-red-core/templates/dialog/cpr-verify-damage-roll-prompt.hbs";
      }
      case "attack": {
        return "systems/cyberpunk-red-core/templates/dialog/cpr-verify-base-roll-prompt.hbs";
      }
      case "stat":
      case "roleAbility":
      case "skill": {
        return "systems/cyberpunk-red-core/templates/dialog/cpr-verify-base-roll-prompt.hbs";
      }
      default: {
        return "systems/cyberpunk-red-core/templates/dialog/cpr-verify-base-roll-prompt.hbs";
      }
    }
  }

  static async RenderPrompt(rollRequest) {
    const template = this.GetVerifyRollTemplate(rollRequest.rollType);
    const data = duplicate(rollRequest);
    return new Promise((resolve, reject) => {
      renderTemplate(template, data).then((html) => {
        const _onCancel = () => {
          LOGGER.trace("_onCancel | Dialog VerifyRollPrompt | called.");
          reject();
        };
        const _onConfirm = (html) => {
          LOGGER.trace("_onConfirm | Dialog VerifyRollPrompt | called.");
          const formData = new FormDataExtended(html.find("form")[0]).toObject();
          if (formData.mods) {
            formData.mods = formData.mods.split(",").map(Number);
          } else {
            formData.mods = [];
          }
          if (rollRequest.rollType === "damage") {
            if (formData.autofire) {
              formData.fireMode = "autofire";
            }
            if (formData.suppressive) {
              formData.fireMode = "suppressive";
            }
          }
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
