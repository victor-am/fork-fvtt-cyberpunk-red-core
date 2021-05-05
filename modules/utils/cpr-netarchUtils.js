/* eslint-disable class-methods-use-this */
/* global game, mergeObject, $, hasProperty, getProperty, setProperty, duplicate */

import LOGGER from "./cpr-logger.js";

export default class CPRNetarchUtils {
  constructor(item) {
    console.log(item);
    this.netarchItem = item;
    this.scene = null;
    this.gridSize = 110;
    this.tileData = {
      arrow: {
        img: "assets/NetrunnerTilesPNGWebM/PNG/Arrow.png",
        width: this.gridSize,
        height: this.gridSize,
        scale: 1,
        x: 0,
        y: 0,
        rotation: 270,
      },
      level: {
        img: "assets/NetrunnerTilesPNGWebM/PNG/Password.png",
        width: this.gridSize * 3,
        height: this.gridSize * 3,
        scale: 1,
        x: 0,
        y: 0,
        rotation: 0,
      },
    };
    this.floorDict = ["Password", "File", "Control Node", "Black ICE", "Asp", "Hellhound", "Killer", "Kraken", "Skunk", "Wisp"];
  }

  // game.netarch = CPRNetarchUtils;

  async _generateNetarchScene() {
    const floorData = duplicate(this.netarchItem.data.data.floors);
    if (floorData.length === 0) {
      console.log("There are no Floors!");
      return;
    }
    if (game.scenes.find((f) => f.name === this.netarchItem.data.name) === null) {
      await this._duplicateScene(this.netarchItem.data.name);
    } else {
      this.scene = game.scenes.find((f) => f.name === this.netarchItem.data.name);
      await this._removeAllTiles();
    }
    const newTiles = [];
    const levelList = [];
    floorData.forEach((floor) => {
      const level = this._checkLevelFormat(floor.level);
      const dv = this._checkDV(floor.dv);
      const content = this._checkFloorType(floor.content);
      if (level === null) {
        console.log("Error with the formatting of the level number!");
        return;
      }
      levelList.push(level);
      const newLevel = duplicate(this.tileData.level);
      newLevel.x = this.gridSize * (-2 + 4 * level[0]);
      if (level[1] === null) {
        newLevel.y = this.gridSize * 2;
      } else {
        newLevel.y = this.gridSize * (2 + 4 * (level[1].charCodeAt(0) - 97));
      }
      if (content !== null) {
        if (content === "Password" || content === "File" || content === "Control Node") {
          if ([6, 8, 10, 12].includes(dv)) {
            newLevel.img = `assets/NetrunnerTilesPNGWebM/PNG/${content.replace(/\s+/g, "")}DV${dv}.png`;
          } else {
            newLevel.img = `assets/NetrunnerTilesPNGWebM/PNG/${content.replace(/\s+/g, "")}.png`;
          }
        } else {
          newLevel.img = `assets/NetrunnerTilesPNGWebM/PNG/${content.replace(/\s+/g, "")}.png`;
        }
      }
      newTiles.push(newLevel);
      const newArrow = duplicate(this.tileData.arrow);
      newArrow.x = this.gridSize * (-3 + 4 * level[0]);
      if (level[1] === null) {
        newArrow.y = this.gridSize * 3;
      } else {
        newArrow.y = this.gridSize * (3 + 4 * (level[1].charCodeAt(0) - 97));
      }
      newTiles.push(newArrow);
    });
    levelList.sort();
    const branchCounter = ["a"];
    levelList.forEach((level) => {
      if (level[1] !== null) {
        if (!branchCounter.includes(level[1])) {
          branchCounter.push(duplicate(level[1]));

          const newArrow = duplicate(this.tileData.arrow);
          newArrow.x = this.gridSize * (-4 + 4 * level[0]);
          newArrow.y = this.gridSize * (3 + 4 * (level[1].charCodeAt(0) - 97));
          newTiles.push(duplicate(newArrow));
          newArrow.x = this.gridSize * (-5 + 4 * level[0]);
          newTiles.push(duplicate(newArrow));
          newArrow.x = this.gridSize * (-5 + 4 * level[0]);
          newArrow.y = this.gridSize * (2 + 4 * (level[1].charCodeAt(0) - 97));
          newArrow.rotation = 0;
          newTiles.push(duplicate(newArrow));
          newArrow.y = this.gridSize * (1 + 4 * (level[1].charCodeAt(0) - 97));
          newTiles.push(duplicate(newArrow));
        }
      }
    });
    this._addTilesToScene(newTiles);
  }

  async _duplicateScene(newName, name = "Net Template") {
    LOGGER.trace("_duplicateScene | CPRINetarchUtils | Called.");
    const scene = game.scenes.find((f) => f.name === name);
    await scene.clone({ name: newName });
    this.scene = game.scenes.find((f) => f.name === newName);
  }

  async _addTilesToScene(tileData) {
    LOGGER.trace("_addTilesToScene | CPRINetarchUtils | Called.");
    if (this.scene === null) {
      console.log("Error no scene defined!");
      return;
    }
    const sceneData = duplicate(this.scene.data);
    tileData.forEach((t) => { sceneData.tiles.push(duplicate(t)); });
    await this.scene.update(sceneData);
  }

  async _removeAllTiles() {
    LOGGER.trace("_removeAllTiles | CPRINetarchUtils | Called.");
    const sceneData = duplicate(this.scene.data);
    sceneData.tiles = [];
    await this.scene.update(sceneData);
  }

  _checkLevelFormat(level) {
    const reg = new RegExp("^[0-9]+[a-z]?$");
    if (reg.test(level)) {
      const number = Number(level.match("^[0-9]+"));
      const letter = level.match("[a-z]$");
      if (letter === null) {
        return [number, null];
      }
      return [number, letter[0]];
    }
    return null;
  }

  _checkDV(dv) {
    const reg = new RegExp("^[0-9]+$");
    if (reg.test(dv)) {
      return Number(dv);
    }
    return null;
  }

  _checkFloorType(content) {
    let exp = "";
    this.floorDict.forEach((d) => { exp = exp.concat("^", d, "(?!\\S)|"); });
    exp = exp.slice(0, -1); // remove the last regex "or"
    const reg = new RegExp(exp);
    if (reg.test(content)) {
      const floorType = content.match(reg);
      return floorType[0];
    }
    return null;
  }
}
