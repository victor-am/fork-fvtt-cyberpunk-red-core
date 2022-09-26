const fs = require("fs-extra");
const path = require("path");
const del = require("del");
const log = require("fancy-log");

// Gulp
const gulp = require("gulp");
const less = require("gulp-less");

const DEFAULT_DESTINATION_FOLDER = "dist";
const SYSTEM_NAME = "cyberpunk-red-core"

// Config
// Read foundryconfig.json if it exists, else use default vaules
// This allows for devs to overwrite `dist/` as the build dir to
// wherever they need it for their local Foundry install.
function resolveDestinationFolder() {
  const localConfigPath = path.resolve("foundryconfig.json");
  const localConfigExists = fs.existsSync(localConfigPath);

  if (localConfigExists) {
    const localDataPath = fs.readJSONSync(localConfigPath).dataPath;
    return path.resolve(path.join(localDataPath, "Data", "systems", SYSTEM_NAME));
  }
  return DEFAULT_DESTINATION_FOLDER;
}

const destFolder = resolveDestinationFolder();

const sourceFiles = [
  { from: "src/cpr.js",         to: "", },
  { from: "src/environment.js", to: "", },
  { from: "src/template.json",  to: "", },
];

const sourceFolders = [
  { from: "src/assets/**/*",    to: "assets",    },
  { from: "src/babele/**/*",    to: "babele",    },
  { from: "src/fonts/**/*",     to: "fonts",     },
  { from: "src/icons/**/*",     to: "icons",     },
  { from: "src/images/**/*",    to: "images",    },
  { from: "src/lang/**/*",      to: "lang",      },
  { from: "src/maps/**/*",      to: "maps",      },
  { from: "src/modules/**/*",   to: "modules",   },
  { from: "src/templates/**/*", to: "templates", },
  { from: "src/tiles/**/*",     to: "tiles",     },
];


async function cleanDist() {
  const files = fs.readdirSync(destFolder);
  const results = [];
  for (const file of files) {
    results.push(del(path.resolve(destFolder, file), { force: true }));
  }

  await Promise.all(results);
}

function compileLess() {
  return gulp.src("src/less/main.less")
    .pipe(less({ javascriptEnabled: true }))
    .pipe(gulp.dest(path.resolve(destFolder)))
    .on("end", () => { log("CPR - CompileLess"); });
}

async function copyAssets() {
  [...sourceFiles, ...sourceFolders].forEach((asset) => {
    gulp.src(asset.from).pipe(gulp.dest(path.resolve(destFolder, asset.to)));
  });
}

async function updateSystem() {
  const version = process.env.CI_COMMIT_TAG ? process.env.CI_COMMIT_TAG : "0.0.0";
  const projectPath = process.env.CI_PROJECT_PATH ? process.env.CI_PROJECT_PATH : "dev";
  const systemRaw = fs.readFileSync("src/system.json");
  const system = JSON.parse(systemRaw);

  system.version = version;
  system.url = `https://gitlab.com/${projectPath}`;
  system.manifest = `https://gitlab.com/${projectPath}/-/jobs/artifacts/${version}/raw/system.json?job=build`;
  system.download = `https://gitlab.com/${projectPath}/-/jobs/artifacts/${version}/raw/cpr.zip?job=build`;

  fs.writeFileSync(path.resolve(destFolder, "system.json"), JSON.stringify(system, null, 2));
}

async function watch() {
  // Helper - watch the pattern, copy the output on change
  function watcher(pattern, out) {
    gulp.watch(pattern)
      .on("all", () => gulp.src(pattern)
        .pipe(gulp.dest(path.resolve(destFolder, out)))
        .on("end", () => log("CPR - Watch")));
  }

  sourceFiles.forEach((file) => watcher(file.from, file.to));
  sourceFolders.forEach((folder) => watcher(folder.from, folder.to));
  gulp.watch("src/**/*.less").on("change", () => compileLess());
}

exports.clean = cleanDist;
exports.assets = copyAssets;
exports.less = compileLess;

exports.build = gulp.series(compileLess, copyAssets, updateSystem);
exports.watch = gulp.series(exports.clean, exports.build, watch);
exports.rebuild = gulp.series(cleanDist, exports.build);
