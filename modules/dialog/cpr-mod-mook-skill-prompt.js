/* global renderTemplate, FormDataExtended, Dialog */

import LOGGER from "../utils/cpr-logger.js";

export default class ModMookSkillPrompt {
  static async RenderPrompt() {
    return new Promise((resolve, reject) => {
      renderTemplate("systems/cyberpunk-red-core/templates/dialog/cpr-mod-mook-skill-prompt.hbs").then((html) => {
        const _onCancel = () => {
          LOGGER.trace("_onCancel | Dialog ModMookSkillPrompt | called.");
          reject();
        };
        // eslint-disable-next-line no-shadow
        const _onConfirm = (html) => {
          LOGGER.trace("_onConfirm | Dialog ModMookSkillPrompt | called.");
          const formData = new FormDataExtended(html.find("form")[0]).toObject();
          resolve(formData);
        };
        new Dialog({
          title: "Add or Modify a Mook's Skill",
          content: html,
          buttons: {
            cancel: {
              icon: "<i class=\"fas fa-times\"></i>",
              label: "Cancel",
              callback: () => _onCancel(html),
            },
            confirm: {
              icon: "<i class=\"fas fa-check\"></i>",
              label: "Confirm",
              // eslint-disable-next-line no-shadow
              callback: (html) => _onConfirm(html),
            },
          },
          default: "confirm",
          render: LOGGER.trace("confirm | Dialog ModMookSkillPrompt | called."),
          close: () => {
            reject();
          },
        }).render(true);
      });
    });
  }
}
