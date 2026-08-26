import assert from "node:assert/strict";
import test from "node:test";

import {
  sceneStatesAt,
  walkthroughDurationMs,
  walkthroughScenes,
  walkthroughSteps,
} from "../src/content/legal-kb-walkthrough";

/*
 * The timeline is data, so it can be checked without a browser. What matters here is the property
 * the later recorder depends on: a (step, beat) pair produces one set of scene states, every time,
 * with no dependence on how it was reached.
 */

test("the run lands inside the intended length", () => {
  const seconds = walkthroughDurationMs() / 1000;
  assert.ok(seconds >= 90 && seconds <= 120, `walkthrough runs ${seconds.toFixed(1)}s`);
});

test("the closing step holds a quiet beat before the run reports itself complete", () => {
  const last = walkthroughSteps[walkthroughSteps.length - 1];
  assert.equal(last.id, "lesson");
  assert.equal(last.beats.length, 2, "the ending needs a settling beat, not an abrupt cut");
  assert.ok(last.beats[1].hold >= 2000, "the settling beat is too short to read as a pause");
  assert.equal(last.beats[1].scene, undefined, "the closing beat changes no scene");
});

test("every step is complete and every beat is usable", () => {
  const ids = new Set<string>();
  for (const step of walkthroughSteps) {
    assert.ok(!ids.has(step.id), `duplicate step id: ${step.id}`);
    ids.add(step.id);
    assert.ok(step.title.trim().length > 0, `${step.id} has no title`);
    assert.ok(step.caption.trim().length > 0, `${step.id} has no caption`);
    assert.ok(step.target.trim().length > 0, `${step.id} has no target`);
    assert.ok(step.beats.length > 0, `${step.id} has no beats`);
    for (const beat of step.beats) {
      assert.ok(beat.hold >= 1000, `${step.id} has a beat shorter than a second`);
      if (beat.scene !== undefined) {
        assert.ok(walkthroughScenes.includes(beat.scene), `${step.id} names an unknown scene`);
        assert.equal(typeof beat.state, "number", `${step.id} names a scene without a state`);
      }
    }
  }
});

test("captions stay short enough to read aloud in their own step", () => {
  for (const step of walkthroughSteps) {
    const words = step.caption.trim().split(/\s+/).length;
    const seconds = step.beats.reduce((sum, beat) => sum + beat.hold, 0) / 1000;
    // Around three words a second is an unhurried reading pace.
    assert.ok(words / seconds <= 3.2, `${step.id}: ${words} words in ${seconds}s is too fast`);
    assert.ok(words <= 60, `${step.id} caption is ${words} words; keep it to a couple of sentences`);
  }
});

test("a step and beat produce the same scene states however they are reached", () => {
  for (let step = 0; step < walkthroughSteps.length; step += 1) {
    for (let beat = 0; beat < walkthroughSteps[step].beats.length; beat += 1) {
      assert.deepEqual(sceneStatesAt(step, beat), sceneStatesAt(step, beat));
    }
  }
});

test("scenes never rewind as the run advances", () => {
  let previous = sceneStatesAt(0, 0);
  for (let step = 0; step < walkthroughSteps.length; step += 1) {
    for (let beat = 0; beat < walkthroughSteps[step].beats.length; beat += 1) {
      const current = sceneStatesAt(step, beat);
      for (const scene of walkthroughScenes) {
        assert.ok(
          current[scene] >= previous[scene],
          `${scene} went backwards at step ${step} beat ${beat}`,
        );
      }
      previous = current;
    }
  }
});

test("the run opens at the beginning and ends with every scene finished", () => {
  const opening = sceneStatesAt(0, 0);
  assert.equal(opening.fanout, 0);
  assert.equal(opening.generations, 0);
  assert.equal(opening.ladder, 0);

  const last = walkthroughSteps.length - 1;
  const closing = sceneStatesAt(last, walkthroughSteps[last].beats.length - 1);
  assert.deepEqual(closing, { fanout: 4, count: 3, generations: 3, ladder: 7 });
});

test("the narrative covers the story the page is built around", () => {
  assert.deepEqual(
    walkthroughSteps.map((step) => step.id),
    ["problem", "source", "representations", "measurement", "change", "confidence", "contribution", "lesson"],
  );
});

test("no caption publishes employer scale", () => {
  for (const step of walkthroughSteps) {
    const text = `${step.title} ${step.caption}`;
    assert.equal(text.match(/\d{2,}/g), null, `${step.id} publishes a numeric quantity`);
    assert.ok(
      !/https?:|\bhttp\b|localhost|\.(?:internal|local|lan|corp)\b/i.test(text),
      `${step.id} leaks an endpoint`,
    );
  }
});
