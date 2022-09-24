const fs = require("fs-extra");
const path = require("path");
const del = require("del");

// Gulp
const gulp = require("gulp");
const less = require("gulp-less");

// Config
// Read foundryconfig.json if it exists, else use default vaules
// This allows for devs to overwrite `dist/` as the build dir to
// wherever they need it for their local Foundry install.
const CONFIG_FILE = path.resolve("foundryconfig.json");
const config = fs.existsSync(CONFIG_FILE) ?
                 fs.readJSONSync(CONFIG_FILE) :
                 {"dataPath": path.resolve(process.cwd(), "dist")}
const destFolder = config.dataPath;

console.log(destFolder);

const sourceFiles = [
  {
    from: "src/cpr.js",
    to: "",
  },
  {
    from: "src/environment.js",
    to: "",
  },
  {
    from: "src/template.json",
    to: "",
  },
];
const sourceFolders = [
  {
    from: "src/assets/**/*",
    to: "assets",
  },
  {
    from: "src/fonts/**/*",
    to: "fonts",
  },
  {
    from: "src/lang/**/*",
    to: "lang",
  },
  {
    from: "src/templates/**/*",
    to: "templates",
  },
  {
    from: "src/modules/**/*",
    to: "packs",
  },
];

async function cleanDist() {

  const files = fs.readdirSync(destFolder);
  const results = [];
  for (const file of files) {
    results.push(del(path.resolve(destFolder, file)));
  }

  await Promise.all(results);
}

function compileLess() {
  return gulp.src("src/less/main.less")
    .pipe(less({ javascriptEnabled: true }))
    .pipe(gulp.dest(path.resolve(destFolder)));
}

async function copyAssets() {
  [...sourceFiles, ...sourceFolders].forEach((asset) => {
    gulp.src(asset.from).pipe(gulp.dest(path.resolve(destFolder, asset.to)));
  });
}

async function updateSystem() {
  const version = process.env.CI_COMMIT_TAG ? process.env.CI_COMMIT_TAG : "0.0.0";
  const project_path = process.env.CI_PROJECT_PATH ? process.env.CI_PROJECT_PATH : "dev";
  const systemRaw = fs.readFileSync("src/system.json");
  let system = JSON.parse(systemRaw);

  system.version = version;
  system.url = `https://gitlab.com/${project_path}`;
  system.manifest = `https://gitlab.com/${project_path}/-/jobs/artifacts/${version}/raw/system.json?job=build`;
  system.download = `https://gitlab.com/${project_path}/-/jobs/artifacts/${version}/raw/cpr.zip?job=build`;
  fs.writeFileSync(path.resolve(destFolder, "system.json"), JSON.stringify(system, null, 2));
}

async function watch() {
  // Helper - watch the pattern, copy the output on change
  function watcher(pattern, out) {
    gulp.watch(pattern).on("change", () => gulp.src(pattern).pipe(gulp.dest(path.resolve(destFolder, out))));
  }

  sourceFolders.forEach((folder) => watcher(folder.from, folder.to));
  sourceFiles.forEach((file) => watcher(file.from, file.to));
  gulp.watch("src/**/*.less").on("change", async () => compileLess());
}

exports.clean = cleanDist;
exports.assets = copyAssets;
exports.less = compileLess;

exports.watch = gulp.series(watch);
exports.build = gulp.series(compileLess, copyAssets, updateSystem);
exports.rebuild = gulp.series(cleanDist, exports.build);
