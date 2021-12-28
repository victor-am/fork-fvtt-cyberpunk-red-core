/* eslint-disable class-methods-use-this */
/* global game, duplicate, Scene */

import LOGGER from "./cpr-logger.js";
import NetarchSceneGenerationPrompt from "../dialog/cpr-netarch-scene-generation-prompt.js";
import SystemUtils from "./cpr-systemUtils.js";

export default class CPRNetarchUtils {
  constructor(item) {
    LOGGER.trace("constructor | CPRNetarchUtils | called.");
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
    this.floorDict = {
      "CPR.netArchitecture.floor.options.password": "Password",
      "CPR.netArchitecture.floor.options.file": "File",
      "CPR.netArchitecture.floor.options.controlnode": "ControlNode",
      "CPR.global.programClass.blackice": "BlackIce",
      "CPR.netArchitecture.floor.options.blackIce.asp": "Asp",
      "CPR.netArchitecture.floor.options.blackIce.giant": "Giant",
      "CPR.netArchitecture.floor.options.blackIce.hellhound": "Hellhound",
      "CPR.netArchitecture.floor.options.blackIce.kraken": "Kraken",
      "CPR.netArchitecture.floor.options.blackIce.liche": "Liche",
      "CPR.netArchitecture.floor.options.blackIce.raven": "Raven",
      "CPR.netArchitecture.floor.options.blackIce.scorpion": "Scorpion",
      "CPR.netArchitecture.floor.options.blackIce.skunk": "Skunk",
      "CPR.netArchitecture.floor.options.blackIce.wisp": "Wisp",
      "CPR.netArchitecture.floor.options.blackIce.dragon": "Dragon",
      "CPR.netArchitecture.floor.options.blackIce.killer": "Killer",
      "CPR.netArchitecture.floor.options.blackIce.sabertooth": "Sabertooth",
      "CPR.netArchitecture.floor.options.demon.demon": "Demon",
      "CPR.netArchitecture.floor.options.demon.balron": "Balron",
      "CPR.netArchitecture.floor.options.demon.efreet": "Efreet",
      "CPR.netArchitecture.floor.options.demon.imp": "Imp",
      "CPR.netArchitecture.floor.options.root": "Root",
    };
  }

  async _generateNetarchScene() {
    LOGGER.trace("_generateNetarchScene | CPRNetarchUtils | called.");
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
      SystemUtils.DisplayMessage("error", SystemUtils.Localize("CPR.netArchitecture.generation.noFloorError"));
      return;
    }
    if (this.options.sceneName === null) {
      if (this.animated) {
        if (game.scenes.find((f) => f.name === `${this.netarchItem.data.name} (animated)`) === null
        || game.scenes.find((f) => f.name === `${this.netarchItem.data.name} (animated)`) === undefined) {
          await this._duplicateScene(`${this.netarchItem.data.name} (animated)`);
        } else {
          this.scene = game.scenes.find((f) => f.name === `${this.netarchItem.data.name} (animated)`);
          await this._removeAllTiles();
        }
      } else if (game.scenes.find((f) => f.name === this.netarchItem.data.name) === null
                 || game.scenes.find((f) => f.name === this.netarchItem.data.name) === undefined) {
        await this._duplicateScene(`${this.netarchItem.data.name}`);
      } else {
        this.scene = game.scenes.find((f) => f.name === this.netarchItem.data.name);
        await this._removeAllTiles();
      }
    } else {
      this.scene = game.scenes.find((f) => f.name === this.options.sceneName);
      if (this.scene === null) {
        SystemUtils.DisplayMessage("error", SystemUtils.Localize("CPR.netArchitecture.generation.noSceneError"));
        return;
      }
      await this._removeAllTiles();
    }
    const newTiles = [];
    const levelList = [];
    floorData.forEach((floor) => {
      const level = Number(floor.floor);
      // eslint-disable-next-line prefer-destructuring
      const branch = floor.branch;
      const dv = this._checkDV(floor.dv);
      const content = this._checkFloorType(floor);
      if (level === null) {
        SystemUtils.DisplayMessage("error", SystemUtils.Localize("CPR.netArchitecture.generation.floorFormattingError"));
        return;
      }
      levelList.push([level, branch]);
      const newLevel = duplicate(this.tileData.level);
      newLevel.x = this.options.gridSize * (this.options.cornerOffsetX + (this.options.levelWidth + this.options.connectorWidth) * (level - 1));
      if (branch === null) {
        newLevel.y = this.options.gridSize * this.options.cornerOffsetY;
      } else {
        newLevel.y = this.options.gridSize * (this.options.cornerOffsetY + (this.options.levelHeight + this.options.connectorHeight) * (branch.charCodeAt(0) - 97));
      }
      if (content !== null) {
        if (content === "Password" || content === "File" || content === "ControlNode") {
          if ([6, 8, 10, 12].includes(dv)) {
            newLevel.img = `${this.options.filePath}${content}DV${dv}.${this.options.fileExtension}`;
          } else {
            newLevel.img = `${this.options.filePath}${content}.${this.options.fileExtension}`;
          }
        } else {
          newLevel.img = `${this.options.filePath}${content}.${this.options.fileExtension}`;
        }
      }
      newTiles.push(newLevel);
      const newArrow = duplicate(this.tileData.arrow);
      newArrow.x = this.options.gridSize
                   * (this.options.cornerOffsetX - this.options.connectorWidth
                   + (this.options.levelWidth + this.options.connectorWidth)
                   * (level - 1));
      if (branch === null) {
        newArrow.y = this.options.gridSize * (this.options.cornerOffsetY + (this.options.levelHeight - this.options.connectorHeight) / 2);
      } else {
        newArrow.y = this.options.gridSize
                     * (this.options.cornerOffsetY
                     + (this.options.levelHeight - this.options.connectorHeight) / 2
                     + (this.options.levelHeight + this.options.connectorHeight)
                     * (branch.charCodeAt(0) - 97));
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
              newArrow.x = this.options.gridSize
                           * (this.options.cornerOffsetX
                           + (this.options.levelWidth + this.options.connectorWidth)
                           * (level[0] - 2)
                           + (this.options.levelWidth - this.options.connectorWidth)
                           / 2);
              newArrow.y = this.options.gridSize
                           * (this.options.cornerOffsetY
                           + (this.options.levelHeight - this.options.connectorHeight)
                           / 2
                           + (this.options.levelHeight + this.options.connectorHeight)
                           * (level[1].charCodeAt(0) - 97)
                           - deltaHeight
                           + (this.options.connectorWidth - this.options.connectorHeight)
                           / 2);
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
              newArrow.x = this.options.gridSize
                           * (this.options.cornerOffsetX
                           + (this.options.levelWidth + this.options.connectorWidth)
                           * (level[0] - 2)
                           + (this.options.levelWidth - this.options.connectorHeight)
                           / 2
                           + deltaWidth
                           - this.options.connectorWidth);
              newArrow.y = this.options.gridSize
                           * (this.options.cornerOffsetY
                           + (this.options.levelHeight - this.options.connectorHeight)
                           / 2
                           + (this.options.levelHeight + this.options.connectorHeight)
                           * (level[1].charCodeAt(0) - 97));
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
              newArrow.x = this.options.gridSize
                           * (this.options.cornerOffsetX
                           + (this.options.levelWidth + this.options.connectorWidth)
                           * (level[0] - 2)
                           + (this.options.levelWidth - this.options.connectorWidth)
                           / 2);
              newArrow.y = this.options.gridSize
                           * (this.options.cornerOffsetY
                           + (this.options.levelHeight - this.options.connectorHeight)
                           / 2
                           + (this.options.levelHeight + this.options.connectorHeight)
                           * (level[1].charCodeAt(0) - 97)
                           - deltaHeight
                           + (this.options.connectorWidth - this.options.connectorHeight)
                           / 2);
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
              newArrow.x = this.options.gridSize
                           * (this.options.cornerOffsetX
                           + (this.options.levelWidth + this.options.connectorWidth)
                           * (level[0] - 2)
                           + (this.options.levelWidth - this.options.connectorHeight)
                           / 2
                           + deltaWidth
                           - this.options.connectorWidth);
              newArrow.y = this.options.gridSize
                           * (this.options.cornerOffsetY
                           + (this.options.levelHeight - this.options.connectorHeight)
                           / 2
                           + (this.options.levelHeight + this.options.connectorHeight)
                           * (level[1].charCodeAt(0) - 97));
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
    await this.scene.view();
    SystemUtils.DisplayMessage("notify", SystemUtils.Localize("CPR.netArchitecture.generation.done"));
  }

  async _duplicateScene(newName) {
    LOGGER.trace("_duplicateScene | CPRNetarchUtils | Called.");
    let scene = null;
    if (this.animated) {
      scene = await game.packs.get("cyberpunk-red-core.scenes").getDocument("kmVVudIkBTEODmcq");
    } else {
      scene = await game.packs.get("cyberpunk-red-core.scenes").getDocument("vHjjIdBSOEQdrgrl");
    }
    const sceneData = duplicate(scene.data);
    sceneData.id = null;
    sceneData.name = newName;
    await Scene.createDocuments([sceneData]);
    this.scene = game.scenes.find((f) => f.name === newName);
  }

  async _addTilesToScene(tileData) {
    LOGGER.trace("_addTilesToScene | CPRNetarchUtils | Called.");
    if (this.scene === null) {
      LOGGER.log("Error no scene defined!");
      return;
    }
    await this.scene.createEmbeddedDocuments("Tile", tileData);
  }

  async _removeAllTiles() {
    LOGGER.trace("_removeAllTiles | CPRNetarchUtils | Called.");
    const tileIds = [];
    this.scene.tiles.forEach((t) => { tileIds.push(t.id); });
    await this.scene.deleteEmbeddedDocuments("Tile", tileIds);
  }

  _checkDV(dv) {
    LOGGER.trace("_checkDV | CPRNetarchUtils | called.");
    const reg = new RegExp("^[0-9]+$");
    if (reg.test(dv)) {
      return Number(dv);
    }
    return null;
  }

  _checkFloorType(floor) {
    LOGGER.trace("_checkFloorType | CPRNetarchUtils | called.");
    if (floor.content === "CPR.global.programClass.blackice" && floor.blackice !== "--") {
      return this.floorDict[floor.blackice];
    }
    return this.floorDict[floor.content];
  }

  async _customize() {
    LOGGER.trace("_customize | CPRNetarchUtils | called.");
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
    formData = await NetarchSceneGenerationPrompt.RenderPrompt(formData).catch((err) => LOGGER.debug(err));
    if (formData === undefined) {
      return;
    }

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
