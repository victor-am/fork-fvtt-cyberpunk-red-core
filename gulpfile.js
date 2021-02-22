const gulp = require('gulp');
const less = require('gulp-less');
const fs = require("fs-extra");
const path = require('path');

/***********************/
/* CONFIG              */
/***********************/

const CONFIG_FILE = path.resolve("foundryconfig.json");
const SYSTEM_NAME = "cyberpunk-red-core";
const LESS_FILES = ["less/*.less"];

/***********************/
/* BUILD TASKS         */
/***********************/

/* ----------------------------------------- */
/*  Build LESS
/* ----------------------------------------- */

async function compileLess() {
  return gulp.src("less/main.less")
    .pipe(less({javascriptEnabled: true}))
    .pipe(gulp.dest("./"))
}

/* ----------------------------------------- */
/*  Clean local system
/* ----------------------------------------- */
async function clean() {
  if (fs.existsSync(CONFIG_FILE)) {
    const config = fs.readJSONSync(CONFIG_FILE);
    const system_path = path.join(
                          config.dataPath,
                          "Data",
                          "systems",
                          SYSTEM_NAME);

    if (fs.existsSync(system_path)) {
      try {
        await fs.rmdir(
          system_path,
          { recursive: true }
        );
        return Promise.resolve();
      } catch (err) {
        Promise.reject(err);
      }
    }
  }
}

/* ----------------------------------------- */
/*  Copy Static Files
/* ----------------------------------------- */

async function copyFiles() {
  const staticFiles = [
    "icons",
    "lang",
    "templates",
    "modules",
    "packs",
    "cpr.js",
    "environment.js",
    "module.json",
    "main.css",
    "system.json",
    "template.json",
  ];

  if (fs.existsSync(CONFIG_FILE)) {
    const config = fs.readJSONSync(CONFIG_FILE);
    const system_path = path.join(
                          config.dataPath,
                          "Data",
                          "systems",
                          SYSTEM_NAME);

    if (!fs.existsSync(system_path)) {
      try {
        fs.mkdirSync(system_path)
      } catch (err) {}
    }
    try {
      for (const file of staticFiles) {
        if (fs.existsSync(path.join(process.cwd(), file))) {
          fs.copy((file), path.join(system_path, file));
        }
      }
      return Promise.resolve();
    } catch (err) {
      Promise.reject(err);
    }
  }
}

/* ----------------------------------------- */
/*  Watch Updates
/* ----------------------------------------- */

function watchUpdates() {

  gulp.watch(LESS_FILES,  { ignoreInitial: false }, compileLess);
  if (fs.existsSync(CONFIG_FILE)) {
    gulp.watch(
      [
        "icons/**/*.*",
        "lang/*.json",
        "templates/**/*.hbs",
        "modules/**/*.js",
        "packs/*.db",
        "cpr.js",
        "module.json",
        "main.css",
        "system.json",
        "template.json",
      ],
      { ignoreInitial: false },
      copyFiles
    );
  }
}

/* ----------------------------------------- */
/*  Export Tasks
/* ----------------------------------------- */

exports.build = gulp.series(clean, compileLess, copyFiles);
exports.watch = gulp.series(clean, watchUpdates);
exports.clean = clean;
exports.css = compileLess;
exports.default = gulp.series(
  clean,
  watchUpdates
);
