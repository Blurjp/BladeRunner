import test from 'node:test';
import assert from 'node:assert/strict';
import { freshState, restoreState, collect, travel, deduce, finish, neededEvidence, objective, districts } from '../src/game.js';

test('a new investigation has a real objective and all districts are open', () => {
  const s = freshState();
  assert.match(objective(s), /封锁现场/);
  for (const d of districts) assert.equal(travel(s, d.id), true);
  assert.equal(s.visited.length, 4);
  assert.equal(travel(s, 'missing'), false);
});
test('evidence is unique and fabricated identifiers cannot enter the case', () => {
  const s = freshState();
  assert.equal(collect(s, 'burn'), true);
  assert.equal(collect(s, 'burn'), false);
  assert.equal(collect(s, 'toString'), false);
  assert.deepEqual(s.evidence, ['burn']);
});
test('deduction requires evidence and the correct suspect, method and motive', () => {
  const s = freshState();
  assert.equal(deduce(s, 'wu', 'overload', 'audit').ok, false);
  neededEvidence.forEach(id => collect(s, id));
  for (const answer of [['han', 'overload', 'audit'], ['wu', 'accident', 'audit'], ['wu', 'overload', 'debt']]) assert.equal(deduce(s, ...answer).ok, false);
  assert.equal(s.solved, false);
  assert.equal(deduce(s, 'wu', 'overload', 'audit').ok, true);
});
test('both endings require a solved case and reward only once', () => {
  for (const choice of ['publish', 'protect']) {
    const s = freshState();
    assert.equal(finish(s, choice), false);
    neededEvidence.forEach(id => collect(s, id)); deduce(s, 'wu', 'overload', 'audit');
    assert.equal(finish(s, choice), true);
    assert.equal(s.credits, 320);
    assert.equal(finish(s, choice), false);
    assert.equal(s.credits, 320);
    assert.deepEqual(restoreState(JSON.stringify(s)), s);
  }
});
test('corrupt and outdated saves recover, invalid state is normalized', () => {
  assert.deepEqual(restoreState('{broken'), freshState());
  assert.deepEqual(restoreState('null'), freshState());
  assert.deepEqual(restoreState('{"version":99}'), freshState());
  const s = restoreState(JSON.stringify({version: 1, district: 'bad', evidence: ['burn', 'burn', '__proto__'], credits: -100, solved: true, ending: 'publish', player: {x: 20, y: -10}}));
  assert.equal(s.district, 'docks'); assert.equal(s.credits, 0); assert.deepEqual(s.evidence, ['burn']); assert.equal(s.solved, false); assert.equal(s.ending, null); assert.deepEqual(s.player, {x: .88, y: .46});
});
