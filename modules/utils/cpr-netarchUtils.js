/* eslint-disable class-methods-use-this */
/* global game, duplicate */

import LOGGER from "./cpr-logger.js";
import NetarchSceneGenerationPrompt from "../dialog/cpr-netarch-scene-generation-prompt.js";
import SystemUtils from "./cpr-systemUtils.js";

export default class CPRNetarchUtils {
  constructor(item) {
    this.netarchItem = item;
    this.options = {
      filePath: "systems/cyberpunk-red-core/tiles/netarch/PNG/",
      fileExtension: "png",
      sceneName: null,
      gridSize: 110,
      connectorWidth: 1,
      connectorHeight: 1,
      levelWidth: 3,
      levelHeight: 3,
      cornerOffsetX: 2,
      cornerOffsetY: 2,
    };
    this.animated = false;
    this.scene = null;
    this.tileData = null;
    this.floorDict = ["Password", "File", "Control Node", "Black ICE", "Asp", "Dragon", "Giant", "Hellhound", "Killer", "Kraken", "Liche", "Raven", "Sabertooth", "Skunk", "Wisp", "Demon", "Balron", "Efreet", "Imp", "Root"];
  }

  async _generateNetarchScene() {
    this.tileData = {
      arrow: {
        img: `${this.options.filePath}Arrow.${this.options.fileExtension}`,
        width: this.options.gridSize * this.options.connectorWidth,
        height: this.options.gridSize * this.options.connectorHeight,
        scale: 1,
        x: 0,
        y: 0,
        rotation: 0,
      },
      level: {
        img: `${this.options.filePath}Root.${this.options.fileExtension}`,
        width: this.options.gridSize * this.options.levelWidth,
        height: this.options.gridSize * this.options.levelHeight,
        scale: 1,
        x: 0,
        y: 0,
        rotation: 0,
      },
    };

    const floorData = duplicate(this.netarchItem.data.data.floors);
    if (floorData.length === 0) {
      SystemUtils.DisplayMessage("error", SystemUtils.Localize("CPR.netarchgeneratenofloorerror"));
      return;
    }
    if (this.options.sceneName === null) {
      if (this.animated) {
        if (game.scenes.find((f) => f.name === `${this.netarchItem.data.name} (animated)`) === null) {
          await this._duplicateScene(`${this.netarchItem.data.name} (animated)`);
        } else {
          this.scene = game.scenes.find((f) => f.name === this.netarchItem.data.name);
          await this._removeAllTiles();
        }
      } else if (game.scenes.find((f) => f.name === this.netarchItem.data.name) === null) {
        await this._duplicateScene(`${this.netarchItem.data.name}`);
      } else {
        this.scene = game.scenes.find((f) => f.name === this.netarchItem.data.name);
        await this._removeAllTiles();
      }
    } else {
      this.scene = game.scenes.find((f) => f.name === this.options.sceneName);
      if (this.scene === null) {
        SystemUtils.DisplayMessage("error", SystemUtils.Localize("CPR.netarchgeneratenosceneerror"));
        return;
      }
      await this._removeAllTiles();
    }
    const newTiles = [];
    const levelList = [];
    floorData.forEach((floor) => {
      const level = this._checkLevelFormat(floor.level);
      const dv = this._checkDV(floor.dv);
      const content = this._checkFloorType(floor.content);
      if (level === null) {
        SystemUtils.DisplayMessage("error", SystemUtils.Localize("CPR.netarchgeneratefloorformattingerror"));
        return;
      }
      levelList.push(level);
      const newLevel = duplicate(this.tileData.level);
      newLevel.x = this.options.gridSize * (this.options.cornerOffsetX + (this.options.levelWidth + this.options.connectorWidth) * (level[0] - 1));
      if (level[1] === null) {
        newLevel.y = this.options.gridSize * this.options.cornerOffsetY;
      } else {
        newLevel.y = this.options.gridSize * (this.options.cornerOffsetY + (this.options.levelHeight + this.options.connectorHeight) * (level[1].charCodeAt(0) - 97));
      }
      if (content !== null) {
        if (content === "Password" || content === "File" || content === "Control Node") {
          if ([6, 8, 10, 12].includes(dv)) {
            newLevel.img = `${this.options.filePath}${content.replace(/\s+/g, "")}DV${dv}.${this.options.fileExtension}`;
          } else {
            newLevel.img = `${this.options.filePath}${content.replace(/\s+/g, "")}.${this.options.fileExtension}`;
          }
        } else {
          newLevel.img = `${this.options.filePath}${content.replace(/\s+/g, "")}.${this.options.fileExtension}`;
        }
      }
      newTiles.push(newLevel);
      const newArrow = duplicate(this.tileData.arrow);
      newArrow.x = this.options.gridSize * (this.options.cornerOffsetX - this.options.connectorWidth + (this.options.levelWidth + this.options.connectorWidth) * (level[0] - 1));
      if (level[1] === null) {
        newArrow.y = this.options.gridSize * (this.options.cornerOffsetY + (this.options.levelHeight - this.options.connectorHeight) / 2);
      } else {
        newArrow.y = this.options.gridSize * (this.options.cornerOffsetY + (this.options.levelHeight - this.options.connectorHeight) / 2 + (this.options.levelHeight + this.options.connectorHeight) * (level[1].charCodeAt(0) - 97));
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
          let deltaHeight = (this.options.connectorHeight + (this.options.levelHeight - this.options.connectorHeight) / 2);
          let deltaWidth = (this.options.levelWidth + this.options.connectorHeight) / 2;
          if (this.options.connectorHeight >= this.options.connectorWidth) {
            newArrow.rotation = 90;
            while (deltaHeight >= this.options.connectorWidth) {
              newArrow.x = this.options.gridSize * (this.options.cornerOffsetX + (this.options.levelWidth + this.options.connectorWidth) * (level[0] - 2) + (this.options.levelWidth - this.options.connectorWidth) / 2);
              newArrow.y = this.options.gridSize * (this.options.cornerOffsetY + (this.options.levelHeight - this.options.connectorHeight) / 2 + (this.options.levelHeight + this.options.connectorHeight) * (level[1].charCodeAt(0) - 97) - deltaHeight + (this.options.connectorWidth - this.options.connectorHeight) / 2);
              if (deltaHeight < 2 * this.options.connectorWidth) {
                newArrow.x -= (newArrow.width / 2) * (deltaHeight / this.options.connectorWidth - 1);
                newArrow.y += (newArrow.width / 2) * (deltaHeight / this.options.connectorWidth - 1);
                newArrow.width *= deltaHeight / this.options.connectorWidth;
                deltaHeight = 0;
              }
              newTiles.push(duplicate(newArrow));
              deltaHeight -= this.options.connectorWidth;
            }
            newArrow.rotation = 0;
            newArrow.width = this.tileData.arrow.width;
            while (deltaWidth >= this.options.connectorWidth) {
              newArrow.x = this.options.gridSize * (this.options.cornerOffsetX + (this.options.levelWidth + this.options.connectorWidth) * (level[0] - 2) + (this.options.levelWidth - this.options.connectorHeight) / 2 + deltaWidth - this.options.connectorWidth);
              newArrow.y = this.options.gridSize * (this.options.cornerOffsetY + (this.options.levelHeight - this.options.connectorHeight) / 2 + (this.options.levelHeight + this.options.connectorHeight) * (level[1].charCodeAt(0) - 97));
              if (deltaWidth < 2 * this.options.connectorWidth) {
                newArrow.x -= newArrow.width * (deltaWidth / this.options.connectorWidth - 1);
                newArrow.width *= deltaWidth / this.options.connectorWidth;
                deltaWidth = 0;
              }
              newTiles.push(duplicate(newArrow));
              deltaWidth -= this.options.connectorWidth;
            }
          } else {
            newArrow.rotation = 90;
            while (deltaHeight >= this.options.connectorWidth) {
              newArrow.x = this.options.gridSize * (this.options.cornerOffsetX + (this.options.levelWidth + this.options.connectorWidth) * (level[0] - 2) + (this.options.levelWidth - this.options.connectorWidth) / 2);
              newArrow.y = this.options.gridSize * (this.options.cornerOffsetY + (this.options.levelHeight - this.options.connectorHeight) / 2 + (this.options.levelHeight + this.options.connectorHeight) * (level[1].charCodeAt(0) - 97) - deltaHeight + (this.options.connectorWidth - this.options.connectorHeight) / 2);
              if (deltaHeight < 2 * this.options.connectorWidth) {
                newArrow.x -= (newArrow.width / 2) * (deltaHeight / this.options.connectorWidth - 1);
                newArrow.y += (newArrow.width / 2) * (deltaHeight / this.options.connectorWidth - 1);
                newArrow.width *= deltaHeight / this.options.connectorWidth;
                deltaHeight = 0;
              }
              newTiles.push(duplicate(newArrow));
              deltaHeight -= this.options.connectorWidth;
            }
            newArrow.rotation = 0;
            newArrow.width = this.tileData.arrow.width;
            while (deltaWidth >= this.options.connectorWidth) {
              newArrow.x = this.options.gridSize * (this.options.cornerOffsetX + (this.options.levelWidth + this.options.connectorWidth) * (level[0] - 2) + (this.options.levelWidth - this.options.connectorHeight) / 2 + deltaWidth - this.options.connectorWidth);
              newArrow.y = this.options.gridSize * (this.options.cornerOffsetY + (this.options.levelHeight - this.options.connectorHeight) / 2 + (this.options.levelHeight + this.options.connectorHeight) * (level[1].charCodeAt(0) - 97));
              if (deltaWidth < 2 * this.options.connectorWidth) {
                newArrow.x -= newArrow.width * (deltaWidth / this.options.connectorWidth - 1);
                newArrow.width *= deltaWidth / this.options.connectorWidth;
                deltaWidth = 0;
              }
              newTiles.push(duplicate(newArrow));
              deltaWidth -= this.options.connectorWidth;
            }
          }
        }
      }
    });
    await this._addTilesToScene(newTiles);
    await this.scene.activate();
  }

  async _duplicateScene(newName) {
    LOGGER.trace("_duplicateScene | CPRINetarchUtils | Called.");
    let scene = null;
    if (this.animated) {
      scene = await game.packs.get("cyberpunk-red-core.scenes").getEntity("kmVVudIkBTEODmcq");
    } else {
      scene = await game.packs.get("cyberpunk-red-core.scenes").getEntity("vHjjIdBSOEQdrgrl");
    }
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

  async _customize() {
    let formData = {
      animated: false,
      cusomTiles: false,
      filePath: "systems/cyberpunk-red-core/tiles/netarch/PNG/",
      fileExtension: "png",
      sceneName: "",
      gridSize: 110,
      connectorWidth: 1,
      connectorHeight: 1,
      levelWidth: 3,
      levelHeight: 3,
      cornerOffsetX: 2,
      cornerOffsetY: 2,
      returnType: "string",
    };
    formData = await NetarchSceneGenerationPrompt.RenderPrompt(formData);
    console.log(duplicate(formData));

    if (formData.cusomTiles) {
      this.options.filePath = formData.filePath;
      this.options.fileExtension = formData.fileExtension;
      this.options.gridSize = Number(formData.gridSize);
      this.options.connectorWidth = Number(formData.connectorWidth);
      this.options.connectorHeight = Number(formData.connectorHeight);
      this.options.levelWidth = Number(formData.levelWidth);
      this.options.levelHeight = Number(formData.levelHeight);
      this.options.cornerOffsetX = Number(formData.cornerOffsetX);
      this.options.cornerOffsetY = Number(formData.cornerOffsetY);
      if (formData.sceneName !== "") {
        this.options.sceneName = formData.sceneName;
      }
    } else if (formData.animated) {
      this.options.filePath = "systems/cyberpunk-red-core/tiles/netarch/WebM/";
      this.options.fileExtension = "webm";
      this.animated = true;
    }

    this._generateNetarchScene();
  }
}
