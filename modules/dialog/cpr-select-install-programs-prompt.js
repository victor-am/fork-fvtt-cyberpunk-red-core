/* eslint-disable no-shadow */
/* global renderTemplate Dialog FormDataExtended */
import LOGGER from "../utils/cpr-logger.js";
import SystemUtils from "../utils/cpr-systemUtils.js";

export default class InstallProgramsPrompt {
  static async RenderPrompt(data) {
    const template = "systems/cyberpunk-red-core/templates/dialog/cpr-select-install-programs-prompt.hbs";
    return new Promise((resolve, reject) => {
      renderTemplate(template, data).then((html) => {
        const _onCancel = () => {
          LOGGER.trace("_onCancel | Dialog InstallProgramsPrompt | called.");
          reject(new Error("Promise rejected: Window Closed"));
        };
        const _onConfirm = (html) => {
          LOGGER.trace("_onConfirm | Dialog InstallProgramsPrompt | called.");
          const programList = html.find("[name=\"selectedPrograms\"");
          const selectedPrograms = [];
          const formData = new FormDataExtended(html.find("form")[0]).toObject();
          Object.keys(programList).forEach((program) => {
            if (programList[program].checked) {
              selectedPrograms.push(programList[program].value);
            }
          });
          formData.selectedPrograms = selectedPrograms;
          resolve(formData);
        };
        new Dialog({
          title: SystemUtils.Localize("CPR.itemSheet.cyberdeck.configureInstalledPrograms"),
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
          render: LOGGER.trace("confirm | Dialog InstallProgramsPrompt | called."),
          close: () => {
            reject(new Error("Promise rejected: Window Closed"));
          },
        }).render(true);
      });
    });
  }
}
