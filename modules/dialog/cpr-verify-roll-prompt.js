// TODO - Revist this method of dialog creation.

import LOGGER from "../utils/cpr-logger.js";

// TODO - Revist name of function.
export async function VerifyRollPrompt() {
    return new Promise(resolve => {
        renderTemplate('systems/cyberpunk-red-core/templates/dialog/cpr-verify-roll-prompt.hbs').then(html => {
            let totalMod = [];
            
            let _onCancel = function (html) {
                LOGGER.trace(`Actor _onCancel | VerifyRollPrompt | called.`);
            };
            
            let _onConfirm = function (html) {
                LOGGER.trace(`Actor _onConfirm | VerifyRollPrompt | called.`);
                if (html.find('[name="mods"]').val() != "") {
                    totalMod.push(Number(html.find('[name="mods"]').val()));
                };
            };
            
            new Dialog({
                title: "Input Modifiers",
                content: html,
                buttons: {
                    cancel: {
                        icon: '<i class="fas fa-times"></i>',
                        label: "Cancel",
                        callback: (html) => _onCancel(html)
                    },
                    confirm: {
                        icon: '<i class="fas fa-check"></i>',
                        label: "Confirm",
                        callback: (html) => _onConfirm(html)
                    }
                },
                default: "confirm",
                render: LOGGER.trace(`Actor _onCancel | VerifyRollPrompt | called.`),
                close: () => { resolve(totalMod); }
            }).render(true);
        });
    });
}
