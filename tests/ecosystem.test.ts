import assert from "node:assert/strict";
import test from "node:test";
import {
  ecosystemCategories,
  ecosystemRepositories,
  getEcosystemHighlights,
  getPopulatedCategories,
  getRepositoriesByCategory,
  repositoryUrl,
} from "../src/content/ecosystem";
import { buildingThreads, focusThemes, getBuildingThreads } from "../src/content/focus";
import { graphEdges, graphNodes, graphStages, getStageNodes, projectPoint } from "../src/content/systems-graph";
import { projects } from "../src/content/portfolio";
import { site } from "../src/content/truth";

test("the repository index is a consistent, deduplicated snapshot", () => {
  const names = ecosystemRepositories.map((repository) => repository.name);
  assert.equal(new Set(names).size, names.length);

  for (const repository of ecosystemRepositories) {
    assert.equal(repositoryUrl(repository), `${site.github}/${repository.name}`);
    assert.ok(ecosystemCategories.includes(repository.category));
    assert.match(repository.lastCommit, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(repository.topics.length > 0, `${repository.name} needs focus areas`);
  }

  const grouped = getPopulatedCategories();
  const total = grouped.reduce((count, group) => count + group.repositories.length, 0);
  assert.equal(total, ecosystemRepositories.length);
  assert.ok(grouped.every((group) => group.repositories.length > 0));
});

test("every case study repository is present in the index and agrees on its URL", () => {
  for (const project of projects) {
    const match = ecosystemRepositories.find((repository) => repositoryUrl(repository) === project.repository);
    assert.ok(match, `${project.slug} has no matching repository entry`);
    assert.equal(match.caseStudySlug, project.slug);
  }
});

test("highlights surface only flagship and active repositories", () => {
  const highlights = getEcosystemHighlights();
  assert.ok(highlights.length > 0);
  assert.deepEqual(
    highlights,
    [...getRepositoriesByCategory("Featured"), ...getRepositoriesByCategory("Active")].filter((repository) =>
      highlights.includes(repository),
    ),
  );
  for (const repository of highlights) {
    assert.ok(repository.category === "Featured" || repository.category === "Active");
  }
});

test("current focus and building threads resolve to real public artifacts", () => {
  const names = new Set(ecosystemRepositories.map((repository) => repository.name));
  for (const thread of buildingThreads) {
    assert.ok(names.has(thread.repository), `${thread.id} references an unknown repository`);
    assert.ok(thread.nextEvidenceGate.length > 20);
  }
  assert.equal(getBuildingThreads().length, buildingThreads.length);
  assert.ok(getBuildingThreads().every((thread) => thread.detail !== undefined));

  for (const theme of focusThemes) {
    assert.ok(theme.evidence.length > 0, `${theme.id} claims a focus with no evidence`);
    for (const item of theme.evidence) assert.match(item.href, /^\//);
  }
});

test("the systems graph never claims work it cannot evidence", () => {
  const ids = new Set(graphNodes.map((node) => node.id));
  const stageIds = new Set(graphStages.map((stage) => stage.id));

  for (const node of graphNodes) {
    assert.ok(stageIds.has(node.stage), `${node.id} sits in an unknown stage`);
    if (node.status === "Direction") {
      assert.equal(node.href, undefined, `${node.id} is a direction and must not link to claimed work`);
    } else {
      assert.ok(node.href, `${node.id} is evidenced and must link to a public artifact`);
    }
  }

  for (const stage of graphStages) assert.ok(getStageNodes(stage.id).length > 0, `${stage.id} is empty`);

  for (const edge of graphEdges) {
    assert.ok(ids.has(edge.from) && ids.has(edge.to));
    assert.notEqual(edge.from, edge.to);
  }
  assert.equal(new Set(graphEdges.map((edge) => `${edge.from}>${edge.to}`)).size, graphEdges.length);
});

test("graph projection keeps every node inside the drawing surface", () => {
  const width = 720;
  const height = 400;
  const unit = Math.min(width / 8, height / 4.6);

  // Sweep a full rotation: no rotation may push a node outside its canvas.
  for (let step = 0; step < 24; step += 1) {
    const yaw = (step / 24) * Math.PI * 2;
    for (const pitch of [-0.85, 0, 0.85]) {
      for (const node of graphNodes) {
        const point = projectPoint(node, yaw, pitch, width, height, unit);
        assert.ok(Number.isFinite(point.x) && Number.isFinite(point.y), "projection produced a non-finite point");
        assert.ok(point.scale > 0, "projection inverted the camera");
        assert.ok(point.x > 20 && point.x < width - 20, `node ${node.id} left the canvas horizontally`);
        assert.ok(point.y > 10 && point.y < height - 10, `node ${node.id} left the canvas vertically`);
      }
    }
  }
});
