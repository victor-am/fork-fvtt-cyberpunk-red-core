// TODO - Finish Refactor, See cyberware-install-prompt.js

import LOGGER from "../utils/cpr-logger.js";
import { CPRArrayUtils } from "../utils/cpr-misc.js";

// TODO - Revist name of function.
export async function VerifyRollPrompt(rollRequest) {
  return new Promise((resolve, reject) => {
    renderTemplate(
      "systems/cyberpunk-red-core/templates/dialog/cpr-verify-roll-prompt.hbs",
      rollRequest
    ).then((html) => {
      let _onCancel = function (html) {
        LOGGER.trace(`_onCancel | Dialog VerifyRollPrompt | called.`);
        reject();
      };

      let _onConfirm = function (html) {
        LOGGER.trace(`_onConfirm | Dialog VerifyRollPrompt | called.`);
        let formData = new FormDataExtended(html.find("form")[0]).toObject();
        if (formData.mods) {
          formData.mods = formData.mods.split(',').map(Number);
        }
        else {
          formData.mods = [];
        }
        resolve(formData);
        // if (rollRequest.rollType === "damage") {
        //   if (rollRequest.weaponType === "assaultRifle" ||
        //       rollRequest.weaponType === "heavySmg" ||
        //       rollRequest.weaponType === "smg") {
        //     if (html.find('[name="autofire"]')[0].checked) {
        //       rollRequest.isAutofire = true;
        //     }
        //     rollRequest.formula = "2d6";
        //     rollRequest.multiplier = Number(
        //       html.find('[name="autofire-multiplier"]').val()
        //     );
        //   };
        //   if (html.find('[name="final-mods"]').val() != "") {
        //     rollRequest.mods.push(Number(
        //       html.find('[name="final-mods"]').val()
        //     ));
        //   }
        // } else {
        //   // Assign Mods
        //   if (html.find('[name="statValue"]').val() != "") {
        //     rollRequest.statValue = Number(
        //       html.find('[name="statValue"]').val()
        //     );
        //   }
        //   if (html.find('[name="skillValue"]').val() != "") {
        //     rollRequest.skillValue = Number(
        //       html.find('[name="skillValue"]').val()
        //     );
        //   }
        //   if (html.find('[name="roleValue"]').val() != "") {
        //     rollRequest.roleValue = Number(
        //       html.find('[name="roleValue"]').val()
        //     );
        //   }
        //   if (html.find('[name="mods"]').val() != "") {
        //     rollRequest.mods = [];
        //     rollRequest.mods = CPRArrayUtils.PushMultipleNumbersFromString(
        //       rollRequest.mods,
        //       html.find('[name="mods"]').val(),
        //       [` `, `,`]
        //     );
        //   }
        //   rollRequest.calculateCritical = html.find('[name="calculateCritical"]')[0].checked;
        // }
      };

      new Dialog({
        title: "Input Modifiers",
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
        render: LOGGER.trace(`confirm | Dialog VerifyRollPrompt | called.`),
        close: () => {
          reject();
        },
      }).render(true);
    });
  });
}
