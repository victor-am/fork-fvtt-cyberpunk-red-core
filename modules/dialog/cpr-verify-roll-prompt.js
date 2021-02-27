/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
/* eslint-disable no-shadow */
/* eslint-disable class-methods-use-this */
/* global renderTemplate, FormDataExtended, Dialog */
// TODO - Finish Refactor, See cyberware-install-prompt.js

import LOGGER from "../utils/cpr-logger.js";

export default class VerifyRollPrompt {
  static async RenderPrompt(cprRoll) {
    const template = `systems/cyberpunk-red-core/templates/dialog/rolls/cpr-verify-roll-${cprRoll.template}-prompt.hbs`;
    const data = duplicate(cprRoll);
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
            formData.mods = formData.mods.replace(/ +/g, ",");
            formData.mods = formData.mods.replace(/,+/g, ",");
            formData.mods = formData.mods.split(",").map(Number);
          } else {
            formData.mods = [];
          }
          switch (cprRoll.template) {
            case "damage":
            case "attack": {
              if (formData.autofire) {
                formData.fireMode = "autofire";
              }
              if (formData.suppressive) {
                formData.fireMode = "suppressive";
              }
              break;
            }
            case "deathsave": {
              const deathPenalties = ["deathPenalty", "baseDeathPenalty"];
              rollRequest.extraVars.forEach((penalty) => {
                if (deathPenalties.includes(penalty.name)) {
                  penalty.value = parseInt(formData[penalty.name], 10);
                  formData.mods.push(penalty.value);
                }
              });
              break;
            }
            default:
          }
          resolve(formData);
        };
        new Dialog({
          title: `Roll Confirmation for ${cprRoll.rollTitle}`,
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
