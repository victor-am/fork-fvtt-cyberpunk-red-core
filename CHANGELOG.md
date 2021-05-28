# Version: 0.76.2 (Hot Fix) |  Date:  2021-05-28
- Non owned actor sheets (Limited and Observer permissions) render again, the content is also shown now.

# Version: 0.76.1 (Hot Fix) |  Date:  2021-05-27
- Programs can now be displayed in gear tab and on mook sheets so that they are actually functional.

# Version 0.76.0 | Date: 2021-05-26

**New Features**
- FnWeather made a great video demonstrating some of the following changes which you can find here: https://www.youtube.com/watch?v=csgB6c5KhkU. Thanks to him!
- Added "Option Slots Size" for optional cyberware. This allows proper tracking of cyberware that can use no slots, or multiple slots. By default when first updating to this version all cyberware has an assumed slot size of 1. Please update your optional cyberware accordingly in line with the core rulebook.
- Added extra content to the cyberware tab to display the amount of 'used' slots for foundational cyberware.
- Added option to reroll duplicate critical injuries. There is a system setting to decide if you want to use it, with the default being off.
- Added functionality to automatically resize the character and item sheets. There is a system setting to decide if you want to use it, with the default being off.
- Added Debug Elements setting for developers.
- Added "Unarmed" weapon type with optional (on by default) automatic damage determination based on BODY.
- Added new functionality for the Net architectures.
  - It can now be configured on its item sheet, adding, removing and editing the floors.
  - If a specific black ICE is selected it is linked to the corresponding black ICE item sheet if it exists. You have to create these black ICE items yourself.
  - In addition one can automatically generate a scene showing the NET architecture. This scene generation allows for floors up to eight (8) deep and up to four (4) branches to be displayed.
  - Experimental: The scene generation can be customized to use custom assets and custom sizes to allow for maximum flexibility.
  - As these new features of the Net architecture are experimental, there might be some problems or bugs. If you find any, please let us know.
- Two built-in scenes (maps) are now available in the compendium, alongside the NET architecture tiles. These have been graciously provided by [SolutionMaps](https://www.patreon.com/solutionmaps).
- The system compendium has now been updated to include ammo, armor, additional cyberware, gear, programs, vehicles and weapons. Simple descriptions are provided to align with the R. Talsorian "Homebrew Content Policy". Please ensure you always reference an official, legally-owned rulebook for the full item description and information. No Actors or "Black ICE" programs are provided, as these count as NPCs under the policy rules and cannot be distributed. If you find any mistakes or typos in the compendia, please let us know in issue #226.
- One can now change item-amount from character sheet for Ammo, Clothing, and Gear item-types.
- If an item has a source set, it now displays in the header of the item sheet.
- Armor SP can now be displayed in resource bars! Select the Star Icon next to equipped armor to make that armor active. Then, set the token up to display the resource(s) named externalData.currentArmorHead, externalData.currentArmorBody, and/or externalData.currentArmorShield.
- Mook sheet improvements
  - Cyberware can be dragged on the sheet and it will automatically be installed.
  - The automatic calculations for hp, humanity, and emp has been disabled.
  - Mook names can be changed on the sheet.
  - The ruler glyph for calculating range DVs has been added.
  - Custom skills work as designed and can be edited.
  - Critical injuries added (same as character sheets).
  - Fixed an alignment issue on weapon section.
  - A notes section has been added for free-form text about the mook.
  - All gear and cyberware can be removed by hovering over and pressing DEL. The tooltips reflect this.
  - Skills can be reset to 0 using the DEL key in the same manner as deleting items.
  - The suppressive fire option is now considered in mook sheets (same as character sheets, see issue #195).
  - Portrait added in an expandable frame.

**Changes**
- Setting the autofire maximum multiplier on an item will now be taken into account when rolling damage for autofire damage rolls.  For weapons defined in the core rules (SMG, H. SMG & Assault Rifles) leaving this as 0 will utilize the core rule set for those items.  You can over-ride the core rules (for homebrew) by actually setting this to a non-zero amount.  If you set the multiplier in the roll dialog to a value higher than the allowable value, it will default to the maximum allowable multiplier.
- Characters are now linked to their token by default, Mooks are not.
- Hoverable input fields now remain visible if field is focused and fade out for a more visually pleasing transition from visible to not-visible. (Thanks to sdenec#3813 because I borrowed some of his code from Tidy5e Sheet to accomplish this.)
- Critical damage roll cards no longer show the bonus damage added to the total, since the bonus damage is directly applied to the hp and does not consider armor (issue #214).
- Added localization to places where it was not implemented. (!325)
- Removed "Core" tag from Critical Injury and DV compendia (which should be imported) to make them distinct from "Skills - Core" and "Cyberware - Core" (which should NOT be imported). (!379)


**Bug Fixes**
- fixed #49 - The equipped glyph now takes the same space as the other two
- fixed #158 - Stat padding fixed for LUCK and EMP, so that they have the same font size as the others
- fixed #176 - Game paused animation properly translates now
- fixed #187 - Item icons are now resizing correctly to fit into their frame
- fixed #189 - EMP stat on new mook sheet can now be modified
- fixed #192 - Fixed that double quotes in wepon names break macros
- fixed #195 - Fixed that 'Has Suppressive Fire' option didn't do anything
- fixed #198 - Removes DV display when others are measuring
- fixed #204 - Fixed IP and Eurobucks Ledger functions to work with unlinked tokens
- fixed #215 - A bug where a newly created, non-edited cyberware would vanish upon install
- fixed #221 & #222 - Correction of two critical injuries
- fixed #224 - Med Tech and Fixer role abilities should now roll correctly, as per RAW
- fixed #228 - Fixed some mook sheet weapon/armor section alignment issues
- fixed !366 - Body ablation not being shown in description tab due to typo

# Version: 0.75.4 (Hot Fix) |  Date:  2021-05-05
- Fixed release manifest to not lock users into version 0.75.3 without possibility to update

# Version: 0.75.3 (Hot Fix) |  Date:  2021-05-02
**Bug Fix**
- Role ability settings were lost when changing other data on the sheet. [issue #203](https://gitlab.com/JasonAlanTerry/fvtt-cyberpunk-red-core/-/issues/203)

# Version: 0.74.1 (Hot Fix) |  Date:  2021-04-25
**Bug Fix**
- Macros were not working due to a change in the way rolls were handled.

# Version: 0.74.0  |  Date:  2021-04-23

**UI/UX**
- FnWeather made a great video demonstrating some of the following changes which you can find here: https://www.youtube.com/watch?v=Q8DP0qcR4AU. Thanks to him!
- Added the ability to show DV for ranged weapons when using the ruler for measurement
  - Right clicking a token, you can select a DV table to use and after setting this, any ruler measurements will show the DV along with the measured range.
  - Ranged Weapons can be also configured to use a specific DV table in the item settings. Weapons with DV Tables associated with them will have a ruler in their Fight Tab which can be clicked to set the DV Table for the associated token to quickly switch DV tables when using the Ruler Measurement Tool.
- Added a Compendium with Roll Tables for Core Ranged DV Measurements from the book also providing a page reference in the description field.  Compendium contains a "DV Generic" table that has a description explaining how to create custom DV tables and how they work with the system.
- Added a "MOD" column to the Skills section of the character sheet and as a field on the Skill Item. When skills (or attacks) are rolled, the dialog will auto-populate with the mod. Skill mods on the character sheet only show non-zero values.
- Introduced some code so that the core skills on the character sheet are localized, which will help with current and future translations.
- Added a "Clothing" item for those stylish chooms (per feature request #165).
- Localized the new item and actor drop-down menus so that they appear more professional.
- Critical Injuries are now items so that injuries can be premade, dragged to the character sheet, and used more easily in critical injury tables.
  - Even better, once you have critical injury tables, you can roll right from the character sheet and it will automatically add a randomized critical injury.
- Wound State penalties automatically apply as mods on the roll (e.g. if the token is Seriously Wounded all actions will automatically have a -2 penalty)
- You can now change the amount of ammo in a weapon's clip right from the fight tab. In addition, you can type "+X" or "-Y" (where X and Y are numbers) into the input and it will perform the math.
- Mook sheet introduced. Please use [issue #181](https://gitlab.com/JasonAlanTerry/fvtt-cyberpunk-red-core/-/issues/181) to suggest improvements or point out rough edges.
- Added "Source" field to item sheets to keep track of where items came from (e.g. Core Rules Pg. 351)
- "Thrown Weapon" is now a weapon type and "Athletics" is now a weapon skill for throwing grenades, etc. Weapons that use the athletics skill also use DEX as the stat, which is consistent with the rules.
- Weapon section of the Fight Tab has been slightly redesigned.
- Shields have been implemented (they are an armor type item).
- Added the ammunition type to the attack and damage roll cards.
- Added "N/A" as a choice for cyberware install location.
- New beautiful artwork for the d6s and d10s (thank you to Flintwyrm!)
- Cleaned up display of chat cards. Most of the data is now by-default hidden and can be opened by clicking on the roll total.
- Rolls now indicate if they are whispered, blind, or self.
- Can now roll damage from the chat card for attack rolls.
- Added ability to unload a weapon.
- Added a field for a static attack modifier on weapons.
- Added a warning on cyberware install to remind users that installing cyberware also deducts from maximum humanity.

**Bug Fixes**
- 'Basic' skills (the ones that all characters have points in) now display as bold again (no issue to reference)
- Token name now correctly displays in chat when rolling from a macro.
- Fixed a bug which caused unlinked tokens to erroneously pull certain data from the parent actor.
- Fixed a bug which caused collapsed gear categories to not retain their state upon character sheet update.


**Plumbing**
- Refactored data model to conform with plans going forward.
- Logging has been overhauled.

# Version: 0.66  (Hotfix) |  Date:  2021-03-21
**Bug Fix:**
- Aimed shot was using the Autofire Skill when attacking instead of using the Weapon Skill
- Suppressive Fire was using the Weapon Skill when attacking instead of using the Autofire Skill
# Version: 0.65  |  Date:  2021-03-20

**UI/UX**

- Implemented a chat command “/red” which will roll 1d10 and explode on a 10 or negatively explode (implode?) on a 1. Rolls of the form “/red+X”, “/red-X”, and “/red XdY” are also supported (though there are no dice icons if Y isn’t a 6 or a 10).
- Macros can now be made for weapons, skills, journal entries and actors by dragging and dropping to the macro bar. Weapon macros can be easily edited to roll for damage, aimed shots, autofire, and suppressive fire.
- Improvement Points now trackable and exist on the front of the character sheet, underneath Humanity.
- Eurobucks tracked in the gear tab.
- Can now view details of installed cyberware in ‘read-only’ mode.
- Being able to edit installed cyberware causes issues so the original fix was to make it so that installed cyberware could not be edited. This had the unintended consequence that you could no longer click on the item to see its description if you wanted to reference how it worked. This solves that issue.
- System setting to allow skipping of the roll dialogue. This basically inverts the function of ctrl-click. This rolls default values on a regular click and brings up the roll modification dialogue on ctrl-click.
- Early implementation for keeping track of critical injuries.
- New glyphs/buttons for autofire and suppressive fire.
- Death saves are now rollable, trackable, and relate to critical injuries.
- Added the option to apply no humanity loss on installation of cyberware. This is useful if the user realizes a mistake after installation. They can uninstall, edit the item and reinstall without having to worry about fixing humanity loss afterwards. Also useful for reinstallation of items like Skill Chips and extra cyberarms for the quick-change mounts.
- Added support for damage formulas like 2d6+2, 3d6-4, etc. for all your homebrew and 2020 conversions.
- Ctrl-click an item name to send its description to chat. This feature is still in the early stages of development and may have some formatting issues on the chat card. These will be addressed as the feature is refined.
- Rolling for cyberware is now printed to chat.
- Items of type ‘gear’ are now equippable (just a cosmetic feature for keeping track of what is on your person vs. somewhere else).
- Improved alignment when there are multiple Roles selected to display.

**Plumbing:**
- All rolls moved off of the character sheet to allow for drag n’ drop macros.
- Foundation for roll glyphs embedded into chat cards implemented.
- Many changes and fixes for data migration during updates.

**Bug Fixes:**
- Applying status condition icons no longer fails.
- Custom pause animation no longer disappears on unpause/re-pause.
- Collapsing the side bar now works as expected.
- Rolls are now displayed as originating from the selected token, rather than the player. If no token is selected or associated with the actor sheet, rolls are displayed from the actor that triggered the roll.
- Fixed alt-text localization for critical injuries section.
- When changing the ammo types on an owned weapon, a race condition was occurring which was intermittently over-writing what the proper value of ammoVariety should be so setting compatible ammo would sometimes just fail. Re-ordered the way things are done and this has resolved this issue.
- Vehicles now correctly display Structural Damage Points (SDP) instead of the erroneous spd.
- Fix for the inability to set compatible ammo for an unowned weapon.
- Fixed a bug where choosing to roll for humanity loss when installing cyberware wouldn’t work.
- Fix for humanity loss looping back and subtracting from the maximum when dropping below 0 upon cyberware installation.
- There was an issue where if you made any change to the character sheet, it would reset the view of the sheet. For example, if you opened the sheet and collapsed category 1, Closed the sheet, Opened the sheet, Category 1 is still collapsed. All Good. Change anything (Pin something, change a skill level) Category 1 would instantly expand.
- Fixed a bug where wound state was not updating properly on some actors.
