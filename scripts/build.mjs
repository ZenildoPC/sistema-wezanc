import {cp,mkdir,readFile} from 'node:fs/promises';
import {Script} from 'node:vm';
new Script(await readFile('frontend/app.js','utf8'));
new Script(await readFile('frontend/sw.js','utf8'));
JSON.parse(await readFile('frontend/manifest.webmanifest','utf8'));
await mkdir('dist',{recursive:true});await cp('frontend','dist',{recursive:true});
console.log('Build pronto em dist/ — sem dependências externas.');
