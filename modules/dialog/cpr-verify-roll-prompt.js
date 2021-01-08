// TODO - Revist this method of dialog creation.

import LOGGER from "../utils/cpr-logger.js";
import { CPRArrayUtils } from "../utils/cpr-misc.js";

// TODO - Revist name of function.
export async function VerifyRollPrompt(rollRequest) {
    console.log(rollRequest);
    return new Promise(resolve => {
        renderTemplate('systems/cyberpunk-red-core/templates/dialog/cpr-verify-roll-prompt.hbs', rollRequest).then(html => {
            
            let _onCancel = function (html) {
                LOGGER.trace(`_onCancel | Dialog VerifyRollPrompt | called.`);
                console.log(html);
                rollRequest.rollType = "abort";
            };
            
            let _onConfirm = function (html) {
                LOGGER.trace(`_onConfirm | Dialog VerifyRollPrompt | called.`);
                // Assign Mods
                if (html.find('[name="statValue"]').val() != "") {
                    rollRequest.statValue = Number(html.find('[name="statValue"]').val());
                };
                if (html.find('[name="skillValue"]').val() != "") {
                    rollRequest.skillValue = Number(html.find('[name="skillValue"]').val());
                };
                if (html.find('[name="roleValue"]').val() != "") {
                    rollRequest.roleValue = Number(html.find('[name="roleValue"]').val());
                };
                if (html.find('[name="mods"]').val() != "") {
                    rollRequest.mods = CPRArrayUtils.PushMultipleNumbersFromString(rollRequest.mods, html.find('[name="mods"]').val(), [` `, `,`]);
                };
                rollRequest.calculateCritical = html.find('[name="calculateCritical"]')[0].checked;
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
                render: LOGGER.trace(`confirm | Dialog VerifyRollPrompt | called.`),
                close: () => { resolve(rollRequest); }
            }).render(true);
        });
    });
}
