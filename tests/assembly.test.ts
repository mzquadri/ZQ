import assert from "node:assert/strict";
import test from "node:test";
import {
  getRepoAssemblies,
  sceneBounds,
  CATEGORY_TOKEN,
  PART_KIND_LABEL,
  SCENE,
} from "../src/content/assembly";
import { ecosystemRepositories, getEcosystemHighlights } from "../src/content/ecosystem";

/**
 * The showcase's 3D layer is decoration over a server-rendered strip, so these tests do
 * not load three.js. They check the two things that can silently go wrong: an assembly
 * drifting outside the camera frustum, and a part label appearing that no registry field
 * actually contains.
 */

/** Narrowest band the island can produce: it only runs at >= 900px wide. */
const NARROWEST_ASPECT = 900 / 430;

test("every assembly maps one part per real registry field", () => {
  const assemblies = getRepoAssemblies();
  assert.ok(assemblies.length > 0 && assemblies.length <= 4);

  for (const assembly of assemblies) {
    const source = ecosystemRepositories.find((repository) => repository.name === assembly.name);
    assert.ok(source, `${assembly.name} is not in the registry`);

    const stack = assembly.parts.filter((part) => part.kind === "stack");
    // Not padded to a uniform count: a repository with fewer focus areas gets fewer parts.
    assert.equal(stack.length, source.topics.length);
    assert.deepEqual(
      stack.map((part) => part.label),
      [...source.topics],
    );

    const category = assembly.parts.filter((part) => part.kind === "category");
    const boundary = assembly.parts.filter((part) => part.kind === "boundary");
    assert.equal(category.length, 1);
    assert.equal(boundary.length, 1);
    assert.equal(category[0].label, source.category);
    assert.equal(boundary[0].label, source.boundary);
  }
});

test("no part label is authored copy", () => {
  // Every string the 3D layer can draw must already exist in the registry.
  const known = new Set<string>();
  for (const repository of ecosystemRepositories) {
    repository.topics.forEach((topic) => known.add(topic));
    known.add(repository.category);
    known.add(repository.boundary);
  }

  for (const assembly of getRepoAssemblies()) {
    for (const part of assembly.parts) {
      assert.ok(known.has(part.label), `"${part.label}" is not a registry value`);
    }
  }
});

test("assemblies stay inside the camera frustum across the whole scroll range", () => {
  const assemblies = getRepoAssemblies();
  const { maxX, minY, maxY } = sceneBounds(assemblies);

  const halfHeight = Math.tan(((SCENE.camera.fov / 2) * Math.PI) / 180) * SCENE.camera.z;
  const halfWidth = halfHeight * NARROWEST_ASPECT;
  const topRoom = halfHeight + SCENE.camera.y;
  const bottomRoom = halfHeight - SCENE.camera.y;

  assert.ok(maxX <= halfWidth, `horizontal clip: needs ${maxX.toFixed(2)}, has ${halfWidth.toFixed(2)}`);
  assert.ok(maxY <= topRoom, `top clip: needs ${maxY.toFixed(2)}, has ${topRoom.toFixed(2)}`);
  assert.ok(-minY <= bottomRoom, `bottom clip: needs ${(-minY).toFixed(2)}, has ${bottomRoom.toFixed(2)}`);

  // Wider bands only add horizontal room, so the narrowest case above is sufficient.
  for (const aspect of [1216 / 517, 1600 / 544, 2560 / 544]) {
    assert.ok(maxX <= halfHeight * aspect, `horizontal clip at aspect ${aspect.toFixed(2)}`);
  }
});

test("the framing keeps a visible margin rather than only just fitting", () => {
  const { maxX, minY, maxY } = sceneBounds(getRepoAssemblies());
  const halfHeight = Math.tan(((SCENE.camera.fov / 2) * Math.PI) / 180) * SCENE.camera.z;
  const halfWidth = halfHeight * NARROWEST_ASPECT;

  assert.ok(maxX / halfWidth < 0.94, "assemblies crowd the side edges");
  assert.ok(maxY / (halfHeight + SCENE.camera.y) < 0.94, "assemblies crowd the top edge");
  assert.ok(-minY / (halfHeight - SCENE.camera.y) < 0.94, "assemblies crowd the bottom edge");
});

test("every category in the highlight set has a theme token", () => {
  for (const repository of getEcosystemHighlights()) {
    const token = CATEGORY_TOKEN[repository.category];
    assert.ok(token?.startsWith("--"), `${repository.category} has no theme token`);
  }
  for (const kind of ["stack", "category", "boundary"] as const) {
    assert.ok(PART_KIND_LABEL[kind]?.length > 0);
  }
});
