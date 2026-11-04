import test from 'node:test';
import assert from 'node:assert/strict';
import {timeTicks,tickLabel} from '../src/time-axis.js';

test('time ticks adapt to viewport and zoom, with rounded local hours',()=>{
 const to=Date.parse('2026-11-04T15:43:00Z');
 for(const hours of [1,6,24,168,720]) {
  const domain=[to-hours*3600000,to];
  const mobile=timeTicks(domain,260),desktop=timeTicks(domain,1000);
  assert.ok(mobile.length>=2&&mobile.length<=4,`mobile ${hours} h`);
  assert.ok(desktop.length>=2&&desktop.length<=11);
  for(const at of desktop)assert.ok(at>=domain[0]&&at<=domain[1]);
  assert.ok(desktop.length>=mobile.length);
 }
 const domain=[to-3600000,to],ticks=timeTicks(domain,1000);
 assert.ok(ticks.every(at=>new Date(at).getUTCMinutes()%10===0));
 assert.equal(tickLabel(ticks[0],domain,ticks).detail,'');
 const week=[to-7*86400000,to],weekTicks=timeTicks(week,1000);
 assert.ok(weekTicks.every(at=>tickLabel(at,week,weekTicks).main.match(/\d{2} (oct|nov)\./)));
});

test('repeated hours at the Paris winter change include UTC offsets',()=>{
 const domain=[Date.parse('2026-10-25T00:00:00Z'),Date.parse('2026-10-25T03:00:00Z')];
 const ticks=timeTicks(domain,1000),labels=ticks.map(at=>tickLabel(at,domain,ticks));
 assert.ok(labels.some(label=>label.main==='02:00'&&label.detail==='UTC+2'));
 assert.ok(labels.some(label=>label.main==='02:00'&&label.detail==='UTC+1'));
});
