/* v1.01 domus records: Ranked = the top-level fields, unranked = D.cu; Glory / Domus rank untouched. node server/test/v101rec.test.js */
'use strict';
const assert=require('assert');const C=require('../src/onlcore.js');const catalog=require('../src/catalog.json');C.setCatalog(catalog);
const D=C.newDomus('Domus Test','acct1','d1',Date.UTC(2026,9,1));
assert.ok(!D.split101&&!D.cu,'a fresh house has no split yet (set on first write)');
/* an old house: history before the split stays in the top-level record */
const O={...D,id:'d2',bouts:10,wins:4,survived:6,fallen:2,lifeCF:100};
C.domusNote(O,{won:true},{cf:10},true);
assert.strictEqual(O.bouts,11);assert.strictEqual(O.wins,5);assert.strictEqual(O.survived,7);assert.strictEqual(O.lifeCF,110);assert.ok(O.split101>0);assert.strictEqual(O.pre101,10,'bouts it had before the split');
assert.deepStrictEqual(O.cu,{bouts:0,wins:0,lifeCF:0,survived:0,fallen:0},'a ranked write leaves the unranked record empty');
/* ranked + unranked */
C.domusNote(D,{won:true},{cf:20},true);C.domusNote(D,{won:false},{cf:5,died:true},true);
C.domusNote(D,{won:true},{cf:7},false);C.domusNote(D,{won:false},{cf:3},false);C.domusNote(D,{won:false},{cf:0,died:true},false);
assert.deepStrictEqual([D.bouts,D.wins,D.survived,D.fallen,D.lifeCF],[2,1,1,1,25],'ranked untouched by custom seats');
assert.deepStrictEqual(D.cu,{bouts:3,wins:1,lifeCF:10,survived:2,fallen:1},'unranked: survivors of non-ranked bouts count too');
assert.strictEqual(D.pre101,0);
/* the published row */
const r=C.domusRow(D);assert.deepStrictEqual(r.cu,D.cu);assert.strictEqual(r.bouts,2);assert.strictEqual(r.pre101,0);assert.ok(r.split101>0);assert.strictEqual(typeof r.split101,'number');
const pub=C.domusPub89(D);assert.deepStrictEqual(pub.cu,D.cu,'visit / house card carry cu');
const none=C.domusRow(C.newDomus('Domus Old','a','d3',1));assert.deepStrictEqual(none.cu,{bouts:0,wins:0,lifeCF:0,survived:0,fallen:0});assert.ok(!none.split101,'no split yet -> the page shows the note');
/* Glory and the Domus rank do not read the new record */
const before=JSON.stringify([D.glory,D.dr98,D.fame,D.treasury]);C.domusNote(D,{won:true},{cf:50},false);assert.strictEqual(JSON.stringify([D.glory,D.dr98,D.fame,D.treasury]),before);
console.log('v1.01 domus records: all checks passed');
