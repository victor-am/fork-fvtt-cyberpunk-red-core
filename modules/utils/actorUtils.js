import LOGGER from "./cpr-logger.js";

export default class ActorUtils {
  
  static async addBasicSkills(actor) {
    // LOGGER.trace(`Actor _addBasicSkills | new character ${this.actor.data.name} created | called.`)
    let basicArray = [];
    const basicSkills = [
      {name: 'concentration', type: 'skill', data: {category: 'awarenessskills', stat: 'will', level: 2, basic: true}},
      {name: 'perception', type: 'skill', data: {category: 'awarenessskills', stat: 'int', level: 2, basic: true}},
      {name: 'athletics', type: 'skill', data: {category: 'bodyskills', stat: 'dex', level: 2, basic: true}},
      {name: 'stealth', type: 'skill', data: {category: 'bodyskills', stat: 'dex', level: 2, basic: true}},
      {name: 'education', type: 'skill', data: {category: 'educationskills', stat: 'int', level: 2, basic: true}},
      {name: 'brawling', type: 'skill', data: {category: 'fightingskills', stat: 'dex', level: 2, basic: true}},
      {name: 'evasion', type: 'skill', data: {category: 'fightingskills', stat: 'dex', level: 2, basic: true}},
      {name: 'conversation', type: 'skill', data: {category: 'socialskills', stat: 'emp', level: 2, basic: true}},
      {name: 'humanperception', type: 'skill', data: {category: 'socialskills', stat: 'emp', level: 2, basic: true}},
      {name: 'persuasion', type: 'skill', data: {category: 'socialskills', stat: 'cool', level: 2, basic: true}},
      {name: 'firstaid', type: 'skill', data: {category: 'techniqueskills', stat: 'tech', level: 2, basic: true}}
    ];
    for (let skill of basicSkills) {
      const created = await Entity.create(skill, {renderSheet: false});
      console.log(created);

      }
  }
}