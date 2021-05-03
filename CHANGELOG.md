# Version: 0.74.2 (Hot Fix) |  Date:  2021-05-02
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
