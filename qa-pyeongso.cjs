const fs=require('fs'),vm=require('vm'),assert=require('assert');
const context={console,window:{addEventListener(){}},document:{addEventListener(){}},localStorage:{setItem(){}},setTimeout,clearTimeout,location:{hash:''},URL,Blob};
vm.createContext(context);vm.runInContext(fs.readFileSync('dist/app.js','utf8'),context);vm.runInContext(fs.readFileSync('dist/pyeongso.js','utf8').replace(/init\(\);\s*$/,''),context);
context.fixture=JSON.parse(fs.readFileSync('dist/pyeongso-data.json','utf8'));vm.runInContext('db=fixture',context);const run=s=>vm.runInContext(s,context);
assert.equal(run('db.menus.length'),45);assert.equal(run('db.menus.filter(m=>m.category==="시그니처").length'),3);assert.equal(run('db.menus.filter(m=>m.category==="주류").length'),8);assert.equal(run('db.sales.length'),0);assert.equal(run('db.materials.length'),0);assert(run('db.menus.every(m=>m.price===null&&m.recipe_version===null)'));
assert(run('db.menus.find(m=>m.name==="명란 오차즈케").tags.includes("간단 안주")'));
for(let name of ['dashboard()','menus()','inventory()','profit()','base()','backup()','canvas()','recordPage("sales")','recordPage("expenses")','recordPage("inventory_events")']){let html=run(name);assert(!html.includes('NaN'),name);assert(!html.includes('2026.09.18'),name);assert(!html.includes('아메리카노'),name)}
assert(run('validBackup({schema:BACKUP_SCHEMA,data:db})'));assert(!run('validBackup({schema:"prep-cafe-backup-v1",data:db})'));
run('db.sales.push({sale_id:"TEST1",date:end,menu_id:"PY001",quantity:2,quantity_unit:"접시",net_sales:20000,unit_food_cost_snapshot:1000,unit_packaging_cost_snapshot:0,payment_fee:300,channel:"매장",unit_price:10000,discount_amount:0,recipe_version:"미등록"})');
assert.equal(run('sum(selected("sales"),"net_sales")'),20000);assert.equal(run('costs(selected("sales"))'),2000);assert(run('recordPage("sales")').includes('2 접시'));assert(run('dashboard()').includes('20,000 원'));assert(run('monthly().a[0]')===20000);assert(run('validate("sales",{...db.sales[0],sale_id:"TEST2",date:"2026-10-11",quantity_unit:""})').includes('판매 단위'));
assert(run('validBackup({schema:BACKUP_SCHEMA,data:db})'));
console.log('PASS: 45-menu catalog, candidate status, deduplication, separate cafe storage, empty real data, all pages, branded backup, quantities with units and linked food/drink metrics');
