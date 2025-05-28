const fs = require('fs').promises;
const path = require('path');

async function generateManifest() {
  const files = [];
  const allowedExtensions = ['.html', '.css', '.js', '.png', '.xml', '.txt'];
  const rootDir = '.';

  async function scanDir(dir) {
    const items = await fs.readdir(dir, { withFileTypes: true });
    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      const relativePath = path.relative(rootDir, fullPath);
      if (item.isDirectory()) {
        if (item.name !== 'node_modules' && !item.name.startsWith('.')) {
          await scanDir(fullPath);
        }
      } else if (allowedExtensions.includes(path.extname(item.name))) {
        const content = await fs.readFile(fullPath);
        files.push({
          key: `/${relativePath.replace(/^\.\//, '').replace(/\\/g, '/')}`,
          value: content.toString('base64'),
          base64: true
        });
      }
    }
  }

  await scanDir(rootDir);
  await fs.writeFile('kv-manifest.json', JSON.stringify(files, null, 2));
  console.log('Generated kv-manifest.json');
}

generateManifest().catch(console.error);