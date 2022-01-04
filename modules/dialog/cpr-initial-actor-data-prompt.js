/* global renderTemplate, FormDataExtended, Dialog */
import SystemUtils from "../utils/cpr-systemUtils.js";
import LOGGER from "../utils/cpr-logger.js";

export default class InitialActorDataPrompt {
  static async RenderPrompt(data) {
    LOGGER.trace("RenderPrompt | InitialActorDataPrompt | called.");
    return new Promise((resolve, reject) => {
      renderTemplate("systems/cyberpunk-red-core/templates/dialog/cpr-initial-actor-data-prompt.hbs", data).then((html) => {
        const _onCancel = () => {
          LOGGER.trace("_onCancel | Dialog InitialActorDataPrompt | called.");
          reject(new Error("Promise rejected: Window Closed"));
        };
        // eslint-disable-next-line no-shadow
        const _onConfirm = (html) => {
          LOGGER.trace("_onConfirm | Dialog InitialActorDataPrompt | called.");
          const formData = new FormDataExtended(html.find("form")[0]).toObject();
          resolve(formData);
        };
        new Dialog({
          title: SystemUtils.Localize("CPR.dialog.createActor.initialData.title"),
          content: html,
          buttons: {
            cancel: {
              icon: "<i class=\"fas fa-times\"></i>",
              label: SystemUtils.Localize("CPR.dialog.common.cancel"),
              callback: () => _onCancel(html),
            },
            confirm: {
              icon: "<i class=\"fas fa-check\"></i>",
              label: SystemUtils.Localize("CPR.dialog.common.confirm"),
              // eslint-disable-next-line no-shadow
              callback: (html) => _onConfirm(html),
            },
          },
          default: "confirm",
          render: LOGGER.trace("confirm | Dialog InitialActorDataPrompt | called."),
          close: () => {
            reject(new Error("Promise rejected: Window Closed"));
          },
        }).render(true);
      });
    });
  }
}
