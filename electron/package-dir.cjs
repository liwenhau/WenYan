const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const root = path.join(__dirname, '..');
const version = require(path.join(root, 'package.json')).version || '0.0.0';
const electronDist = path.join(root, 'node_modules', 'electron', 'dist');
const outputRoot = path.join(root, 'release-manual');
const appName = 'WenYan-win-x64';
const outputDir = path.join(outputRoot, appName);
const archivePath = path.join(outputRoot, `WenYan-${version}-win-x64.tar.gz`);

const copy = (from, to) => {
  fs.cpSync(from, to, {
    recursive: true,
    force: true,
    filter: (source) => !source.includes(`${path.sep}release-manual${path.sep}`)
  });
};

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));

const findPackageJson = (start) => {
  let current = fs.statSync(start).isDirectory() ? start : path.dirname(start);
  while (current && current !== path.dirname(current)) {
    const candidate = path.join(current, 'package.json');
    if (fs.existsSync(candidate)) return candidate;
    current = path.dirname(current);
  }
  throw new Error(`Unable to find package.json for ${start}`);
};

const modulePath = (name, base) => {
  try {
    return require.resolve(`${name}/package.json`, { paths: [base, root] });
  } catch (error) {
    if (error.code !== 'ERR_PACKAGE_PATH_NOT_EXPORTED') throw error;
    return findPackageJson(require.resolve(name, { paths: [base, root] }));
  }
};

const copyRuntimePackage = (name, fromDir, copied = new Set()) => {
  const packageJsonPath = modulePath(name, fromDir);
  const packageDir = path.dirname(packageJsonPath);
  const key = fs.realpathSync(packageDir);
  if (copied.has(key)) return;
  copied.add(key);

  const destination = path.join(appDir, 'node_modules', name);
  copy(packageDir, destination);
  fs.rmSync(path.join(destination, 'node_modules'), { recursive: true, force: true });

  const packageJson = readJson(packageJsonPath);
  const dependencies = {
    ...(packageJson.dependencies || {}),
    ...(packageJson.optionalDependencies || {})
  };

  for (const dependencyName of Object.keys(dependencies)) {
    copyRuntimePackage(dependencyName, packageDir, copied);
  }
};

if (!fs.existsSync(path.join(root, 'dist', 'index.html'))) {
  throw new Error('Missing dist/index.html. Run pnpm run build first.');
}

if (!fs.existsSync(path.join(electronDist, 'electron.exe'))) {
  throw new Error('Missing Electron runtime. Run pnpm install first.');
}

fs.rmSync(outputDir, { recursive: true, force: true });
fs.mkdirSync(outputRoot, { recursive: true });
copy(electronDist, outputDir);

const electronExe = path.join(outputDir, 'electron.exe');
const wenyanExe = path.join(outputDir, 'WenYan.exe');
if (fs.existsSync(wenyanExe)) fs.rmSync(wenyanExe, { force: true });
fs.renameSync(electronExe, wenyanExe);

const defaultApp = path.join(outputDir, 'resources', 'default_app.asar');
fs.rmSync(defaultApp, { force: true });

const appDir = path.join(outputDir, 'resources', 'app');
fs.mkdirSync(appDir, { recursive: true });
copy(path.join(root, 'dist'), path.join(appDir, 'dist'));
copy(path.join(root, 'electron'), path.join(appDir, 'electron'));
copy(path.join(root, 'public'), path.join(appDir, 'public'));
fs.mkdirSync(path.join(appDir, 'node_modules'), { recursive: true });
copyRuntimePackage('NeteaseCloudMusicApi', root);
fs.copyFileSync(path.join(root, 'package.json'), path.join(appDir, 'package.json'));

fs.rmSync(archivePath, { force: true });
const tar = spawnSync('tar', ['-czf', archivePath, '-C', outputRoot, appName], {
  cwd: root,
  stdio: 'inherit',
  shell: process.platform === 'win32'
});

if (tar.status !== 0) {
  throw new Error('Failed to create release archive.');
}

const sizeMb = (fs.statSync(archivePath).size / 1024 / 1024).toFixed(1);
console.log(`Packaged ${outputDir}`);
console.log(`Created ${archivePath} (${sizeMb} MB)`);
