import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readCockpitConfig,defaultConfig} from '../src/cockpit-layout.js';
import {eventValue,journalData} from '../src/journal.js';
const key='test.cockpit';
function store(saved){const values=new Map([[key,JSON.stringify(saved)]]);return {getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v)};}
test('custom cockpit positions survive retirement of old technical modules and original is backed up',()=>{
 const saved={version:1,ids:['hk1','modulation','system'],layouts:{lg:[{i:'hk1',x:5,y:2,w:4,h:4},{i:'modulation',x:0,y:7,w:4,h:4},{i:'system',x:0,y:12,w:4,h:4}],xs:[{i:'hk1',x:0,y:0,w:1,h:4},{i:'modulation',x:0,y:4,w:1,h:4},{i:'system',x:0,y:8,w:1,h:4}]}};
 const storage=store(saved),result=readCockpitConfig(storage,key);
 assert.deepEqual(result.ids,['hk1','activity']);
 assert.deepEqual(result.layouts.lg[0],{i:'hk1',x:5,y:2,w:4,h:4,minW:2,minH:3,maxH:7});
 assert.deepEqual(JSON.parse(storage.getItem(key+'.before-3.0.2')),saved);
 assert.ok(result.layouts.lg.find(r=>r.i==='activity').y>=6);
});
test('an intentionally empty cockpit stays empty, corrupt or blocked stores recover',()=>{
 assert.deepEqual(readCockpitConfig(store({version:2,ids:[],layouts:{lg:[]}}),key),{ids:[],layouts:{lg:[]}});
 assert.deepEqual(readCockpitConfig({getItem(){throw new Error('blocked');}},key),defaultConfig());
 assert.deepEqual(readCockpitConfig(store({version:2,ids:['hk1','hk1'],layouts:{lg:[]}}),key),defaultConfig());
 assert.ok(!defaultConfig().ids.includes('temperatures'));
 assert.ok(defaultConfig().ids.includes('activity'));
});
test('pump changes are readable and unknown device values stay visible',()=>{
 assert.equal(eventValue({kind:'pump'},'0'),'À l’arrêt');
 assert.equal(eventValue({kind:'pump'},'1'),'En marche');
 assert.equal(eventValue({kind:'pump'},'2'),'2');
 assert.equal(eventValue({kind:'status0'},'Arrêt'),'Arrêt');
 assert.equal(journalData([{kind:'pump'},{kind:'status0'}]).summary.events,2);
});

test('the unchanged original 3.0.1 cockpit gets the new journal layout, with a reversible backup',async()=>{
 const {readFile}=await import('node:fs/promises');
 const saved=JSON.parse(await readFile(new URL('./testdata/cockpit-v301.json',import.meta.url)));
 const storage=store(saved),result=readCockpitConfig(storage,key);
 assert.deepEqual(result,defaultConfig());
 assert.deepEqual(JSON.parse(storage.getItem(key+'.before-3.0.2')),saved);
 // A customised mobile arrangement must not be mistaken for an untouched default.
 saved.layouts.xs.find(r=>r.i==='boiler').h=5;
 const customised=readCockpitConfig(store(saved),key);
 assert.equal(customised.layouts.xs.find(r=>r.i==='boiler').h,5);
 assert.ok(customised.ids.includes('temperatures'));
});
