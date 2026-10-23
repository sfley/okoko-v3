import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createDemoData } from '../demo/data.js';
test('demo uses its explicit fictional marker and Paris calendar across the year boundary', () => {
  const data = createDemoData(new Date('2026-12-31T23:30:00Z'));
  assert.equal(data.snapshot.demo,true);
  assert.equal(data.weather.current_day,'2027-01-01');
  assert.equal(data.pellets.monthly.length,1);
  assert.equal(data.pellets.monthly[0].year,2027);
  assert.deepEqual([...new Set(data.weather.forecast.map(r=>r.day))],['2027-01-01','2027-01-02','2027-01-03','2027-01-04']);
});
test('demo provides finite series, actual time slots and enough import rows for pagination', () => {
  const data=createDemoData(new Date('2026-10-23T08:00:00Z'));
  assert.equal(data.history.length,144);
  assert.ok(data.history.every(r=>['hk1','hk2','ww1','outdoor','modulation'].every(k=>Number.isFinite(r[k]))));
  assert.equal(data.weather.forecast.length,12);
  assert.ok(data.weather.forecast.every(r=>[8,12,18].includes(r.hour)));
  assert.equal(data.system.runs.length,25);
  assert.match(data.pellets.refills[0].note,/fictive/);
});
