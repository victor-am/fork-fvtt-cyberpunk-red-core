// TODO - Revist this method of dialog creation.
// TODO - Revist name of function.
export async function RollModifierPromptDiag() {
    return new Promise(resolve => { 
        renderTemplate('systems/cyberpunk-red-core/templates/dialog/cpr-rollmod-dialog.hbs').then(html => {
            let totalMod = "cancel";
            new Dialog({
                title: "Input Modifiers",
                content: html,
                buttons: {
                    cancel: {
                        icon: '<i class="fas fa-times"></i>',
                        label: "Cancel",
                        callback: (html) => totalMod = "cancel"
                    },
                    confirm: {
                        icon: '<i class="fas fa-check"></i>',
                        label: "Confirm",
                        callback: (html) => totalMod = html.find('[name="mods"]').val()
                    }
                },
                default: "confirm",
                render: console.log("Register interactivity in the rendered dialog"),
                close: () => { resolve(totalMod); }
            }).render(true);
        });
    });
}
