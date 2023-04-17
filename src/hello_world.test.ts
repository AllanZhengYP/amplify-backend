import { test } from 'node:test';
import assert from 'node:assert';
import { helloWorld } from './hello_world.js';

test('The program properly greets the world', () => {
  const tracker = new assert.CallTracker();
  const greeter = () => null;
  const greeterTracker = tracker.calls(greeter, 1);
  helloWorld(greeterTracker);
  assert.deepStrictEqual(tracker.getCalls(greeterTracker), [
    { thisArg: undefined, arguments: ['Hello, world.'] },
  ]);

  tracker.verify();
});
