import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const srcDir = path.join(root, 'src');
const appPath = path.join(srcDir, 'App.jsx');
const componentDir = path.join(srcDir, 'components');
const externalEntrypoints = new Set(['/', '/admin-login', '/moderator-login', '/support-login']);

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(fullPath);
    return /\.(js|jsx|ts|tsx)$/.test(entry.name) ? [fullPath] : [];
  });
}

function rel(file) {
  return path.relative(root, file).replaceAll(path.sep, '/');
}

const appSource = read(appPath);
const routes = [...appSource.matchAll(/<Route\s+path="([^"]+)"/g)]
  .map((match) => match[1])
  .filter((route) => route !== '*');

const sourceFiles = walk(srcDir);
const sourceByFile = new Map(sourceFiles.map((file) => [file, read(file)]));

const routeReferences = new Map(routes.map((route) => [route, []]));

for (const [file, source] of sourceByFile) {
  if (file === appPath) continue;
  for (const route of routes) {
    if (route === '/') continue;
    if (source.includes(`'${route}'`) || source.includes(`"${route}"`)) {
      routeReferences.get(route).push(rel(file));
    }
  }
}

const unreferencedRoutes = routes.filter((route) => {
  if (externalEntrypoints.has(route)) return false;
  return routeReferences.get(route).length === 0;
});

const componentFiles = fs.readdirSync(componentDir)
  .filter((name) => name.endsWith('.jsx'))
  .map((name) => path.join(componentDir, name));

const unusedComponents = componentFiles.filter((file) => {
  const componentName = path.basename(file, '.jsx');
  return !sourceFiles.some((sourceFile) => {
    if (sourceFile === file) return false;
    const source = sourceByFile.get(sourceFile);
    return source.includes(`./components/${componentName}`)
      || source.includes(`./${componentName}`)
      || source.includes(`../components/${componentName}`);
  });
}).map(rel);

if (unreferencedRoutes.length || unusedComponents.length) {
  console.error('Workflow audit failed.');
  if (unreferencedRoutes.length) {
    console.error(`Unreferenced routes: ${unreferencedRoutes.join(', ')}`);
  }
  if (unusedComponents.length) {
    console.error(`Unused components: ${unusedComponents.join(', ')}`);
  }
  process.exit(1);
}

console.log(`Workflow audit passed: ${routes.length} routes, ${componentFiles.length} components.`);
