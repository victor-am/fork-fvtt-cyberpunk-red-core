// TODO - Revist this method of dialog creation.

import LOGGER from "../utils/cpr-logger.js";

// TODO - Revist name of function.
export async function InstallCyberwarePrompt(data) {
    return new Promise((resolve, reject) => {
        renderTemplate("systems/cyberpunk-red-core/templates/dialog/cpr-install-cyberware-prompt.hbs", data).then((html) => {
            let _onCancel = function (html) {
                LOGGER.trace(`_onCancel | Dialog VerifyRollPrompt | called.`);
                reject();
            };

            let _onConfirm = function (html) {
                LOGGER.trace(`_onConfirm | Dialog VerifyRollPrompt | called.`);
                let formData = new FormDataExtended(html.find("form")[0]).toObject();
                resolve(formData);
            };

            new Dialog({
                title: "Install Cyberware",
                content: html,
                buttons: {
                    cancel: {
                        icon: '<i class="fas fa-times"></i>',
                        label: "Cancel",
                        callback: (html) => _onCancel(html),
                    },
                    confirm: {
                        icon: '<i class="fas fa-check"></i>',
                        label: "Install",
                        callback: (html) => _onConfirm(html),
                    },
                },
                default: "confirm",
                render: LOGGER.trace(`render | Dialog InstallCyberWare | Called.`),
                close: () => {
                    reject();
                },
            }).render(true);
        });
    });
}
