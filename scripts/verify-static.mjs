import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';

const output=new URL('../dist/',import.meta.url);
const config=JSON.parse(await readFile(new URL('../vercel.json',import.meta.url),'utf8'));
assert.equal(config.outputDirectory,'dist','Vercel must serve the static application directory.');
assert.equal(config.framework,null,'This app uses plain HTML, CSS and JavaScript.');
const html=await readFile(new URL('index.html',output),'utf8');
const assets=[...html.matchAll(/(?:src|href)="([^"#]+)"/g)].map(m=>m[1]).filter(p=>!p.includes(':'));
for(const asset of [...assets,'pyeongso-data.json']){
  assert((await stat(new URL(asset,output))).isFile(),`Missing deployment asset: ${asset}`);
}
const data=JSON.parse(await readFile(new URL('pyeongso-data.json',output),'utf8'));
assert.equal(data.meta.dataset_id,'pyeongso-operations');
assert.equal(data.menus.length,45);
console.log(`Static deployment verified: ${fileURLToPath(output)} (${assets.length} referenced assets + menu data).`);
