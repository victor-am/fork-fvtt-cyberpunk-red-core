import LOGGER from "../utils/cpr-logger.js";

export async function SelectAmmoPrompt(dialogData) {
    LOGGER.trace(`_loadWeapon | Dialog SelectAmmoForWeapon | called.`);
    return new Promise((resolve) => {
        renderTemplate(
          "systems/cyberpunk-red-core/templates/dialog/cpr-select-ammo-prompt.hbs",
          dialogData
        ).then((html) => {
          let _onCancel = function (html) {
            LOGGER.trace(`_loadWeapon | Dialog SelectAmmoForWeapon | called.`);
            
            dialogData.selectedAmmo = "abort";
          };
    
          let _onConfirm = function (html) {
            LOGGER.trace(`_loadWeapon | Dialog SelectAmmoForWeapon | called.`);
            const rButtons = html.find('[name="selectedAmmo"');
            for (const rb of rButtons) {
                if (rb.checked) {
                    dialogData.selectedAmmo = rb.value;
                    break;
                }
            }
          };
    
          new Dialog({
            title: "Select Ammunition",
            content: html,
            buttons: {
              cancel: {
                icon: '<i class="fas fa-times"></i>',
                label: "Cancel",
                callback: (html) => _onCancel(html),
              },
              confirm: {
                icon: '<i class="fas fa-check"></i>',
                label: "Confirm",
                callback: (html) => _onConfirm(html),
              },
            },
            default: "confirm",
            render: LOGGER.trace(`confirm | Dialog SelectAmmoForWeapon | called.`),
            close: () => {
              resolve(dialogData);
            },
          }).render(true);
        });
      });
    }
    