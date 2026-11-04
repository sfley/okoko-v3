import { test } from 'node:test';
import assert from 'node:assert/strict';
import { otherDHWReading } from '../src/dhw.js';
test('DHW on/off roles using the same sensor never imply a second physical sensor',()=>{
 assert.equal(otherDHWReading({sensor_on:0,sensor_off:0,temperature_off:39.7}),null);
 assert.equal(otherDHWReading({sensor_on:0,sensor_off:0,temperature_off:36.5}),null);
 assert.equal(otherDHWReading({temperature_low:36.5,temperature_off:36.5}),null);
});
test('a second reading requires different explicit sensor selections, not different temperatures',()=>{
 assert.equal(otherDHWReading({sensor_on:0,sensor_off:1,temperature_off:39.7}),39.7);
 assert.equal(otherDHWReading({sensor_on:0,sensor_off:1,temperature_off:null}),null);
 assert.equal(otherDHWReading({sensor_on:-1,sensor_off:1,temperature_off:39.7}),null);
});
