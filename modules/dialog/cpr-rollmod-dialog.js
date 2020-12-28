// Give this input data
export async function RollModiferPromptDiag() {
    return new Promise(resolve => { 
        renderTemplate('systems/cyberpunk-red-core/templates/dialog/cpr-rollmod-dialog.hbs').then(html => {
            let totalMod = 0;
            new Dialog({
                title: "Input Modifiers",
                content: html,
                buttons: {
                    cancel: {
                        icon: '<i class="fas fa-times"></i>',
                        label: "Cancel",
                        callback: (html) => totalMod = 0
                    },
                    confirm: {
                        icon: '<i class="fas fa-check"></i>',
                        label: "Confirm",
                        callback: (html) => totalMod = html.find('[name="mods"]').val()
                    }
                },
                default: "confirm",
                render: html => console.log("Register interactivity in the rendered dialog"),
                close: html => { resolve(totalMod); }
            }).render(true);
        });
    });
}
