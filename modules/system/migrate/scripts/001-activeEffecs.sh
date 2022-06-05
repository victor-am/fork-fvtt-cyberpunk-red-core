#!/bin/bash
#
# This was the scripted used to migrate the system compendia provided with CPR-C.
# It is provided for the sake of history and audit, it does not need to be run again.
# See 001-activeEffects.js comments for what changed in the data model per item type.
# That will explain what this script should have done.
#
# Remember that the Active Effects themselves were added by community members manually.
# All this script needs to do is remove or rename unneeded properties. If you want to
# test this work, pick a pack and run these commands on it in a linux terminal:
#     # $ jq . pack.db > pack.db.old
#     # $ jq (long command below) > pack.db.new && diff -u pack.db.old pack.db.new
#

PACKPATH='../../../../packs'
TMPFILE="$PACKPATH/temp.json"
JQOPTS="-c" # minifies the output

# ammo
PACK="$PACKPATH/ammo.db"
jq $JQOPS 'del(.data.quality) | del(.data.upgrades) | del(.data.isUpgraded) | .data.concealable.concealable = true' $PACK > $TMPFILE
# price data was already set
# variety was already set
# type was already set
mv $TMPFILE $PACK

# armor
PACK="$PACKPATH/armor.db"
jq $JQOPS 'del(.data.quality) | del(.data.amount) | .data.usage = "equipped"' $PACK > $TMPFILE
# slots was already set to 3 (?)
# usage was all toggled (?)
# price data was already set
mv $TMPFILE $PACK

# clothing
PACK="$PACKPATH/clothing.db"
jq $JQOPS '.data.usage = "equipped"' $PACK > $TMPFILE
# slots was already set to 3 (?)
# price data was already set
# type was already set
# style was already set
mv $TMPFILE $PACK

# critical injuries
# nothing to do here as usage was already set and that is the only change
# PACK="$PACKPATH/critical-injuries-body.db"
# PACK="$PACKPATH/critical-injuries-head.db"
# jq $JQOPS '' > $TMPFILE
# mv $TMPFILE $PACK

# cyberware
PACK="$PACKPATH/cyberware.db" # needed?
PACK="$PACKPATH/cyberware-items.db"
# !!! some size and slotSize values did not agree (?)
jq $JQOPS 'del(.data.charges) | .data.size = .data.slotSize | del(.data.slotSize)' $PACK > $TMPFILE
# usage was already set
# slots was already set
# price data was already set
mv $TMPFILE $PACK

# For drugs, we just move them out of the gear compendium. Twig already created them in there.
jq $JQOPS 'select(.type == "drug")' "$PACKPATH/gear.db" > "$PACKPATH/drugs.db"
jq $JQOPS 'del(select(.type == "drug"))' "$PACKPATH/gear.db" > $TMPFILE 
# the above command leaves "null" for each item deleted, so we clean that here
sed /^null$/d $TMPFILE > "$PACKPATH/gear.db"
rm $TMPFILE

# nothing for elflines since it is a collection of macros

# gear
PACK="$PACKPATH/gear.db"
jq $JQOPS 'del(.data.quality)' $PACK > $TMPFILE
# usage was already set
# slots was already set
# price data was already set
mv $TMPFILE $PACK

# item upgrades
PACK="$PACKPATH/item-upgrades.db"
jq $JQOPS 'del(.data.quality) | del(.data.charges) | del(.data.amount)' $PACK > $TMPFILE
# modifier data was already set
# price data already set
mv $TMPFILE $PACK

# no items in net-rolltables.db

# programs
PACK="$PACKPATH/programs.db"
jq $JQOPS 'del(.data.quality) | del(.data.slots) | del(.data.isDemon) | del(.data.modifiers) | del(.data.amount)' $PACK > $TMPFILE
# usage data already set
# size data already set
# price data already set
mv $TMPFILE $PACK

# roles
PACK="$PACKPATH/roles.db"
jq $JQOPS '.data.bonuses = .data.skillBonuses | del(.data.skillBonusesj)' $PACK > $TMPFILE
mv $TMPFILE $PACK

# skills
# skillmod looked already missing (?)
# PACK="$PACKPATH/skills.db"
# jq $JQOPS '' $PACK > $TMPFILE
# mv $TMPFILE $PACK

# vehicles
PACK="$PACKPATH/vehicles.db"
jq $JQOPS 'del(.data.quality) | del(.data.amount)' $PACK > $TMPFILE
# price data already set
# slots already set
mv $TMPFILE $PACK

# weapons
PACK="$PACKPATH/weapons.db"
jq $JQOPS '.data.usage = "equipped" | del(.data.charges) | del(.data.amount)' $PACK > $TMPFILE
# slot data already set
# price data already set
mv $TMPFILE $PACK
