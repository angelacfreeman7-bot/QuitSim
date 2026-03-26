const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '..');

const config = getDefaultConfig(projectRoot);

// Explicitly set project root to mobile/ — prevents Metro from
// resolving the entry point from the monorepo root
config.projectRoot = projectRoot;

// Only watch packages/ for @quitsim/core changes — NOT the entire
// monorepo root, which caused Metro to resolve ./index from QuitSim/
// instead of QuitSim/mobile/ (the #1 cause of the black screen bug)
config.watchFolders = [
  path.resolve(monorepoRoot, 'packages'),
];

// Resolve packages from mobile/node_modules first, then root/node_modules
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

module.exports = config;
