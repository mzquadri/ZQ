import assert from "node:assert/strict";
import test from "node:test";

import { homeIntro, portraitCredit } from "../src/content/home";
import {
  homeEducation,
  homeExperience,
  homeSkills,
  researchHighlights,
} from "../src/content/home-sections";
import { selectedWork } from "../src/content/home-work";

/*
 * The home page is the surface a recruiter reads against the CV in front of
 * them, so these pin the claims that would be noticed if they drifted.
 *
 * Several of these exist because the page got them wrong once. The AUDI entry
 * described something other than the release-tracking tool; the project cards
 * were headed by aphorisms instead of names; the BP-IT role carried dates the
 * owner wants only on the CV. A comment saying "do not change this" is not a
 * check, so each is a test.
 */

test("the introduction is the owner's supplied copy, not the CV paragraph", () => {
  assert.equal(homeIntro.length, 4);
  assert.match(homeIntro[0], /^Hi, I'm Zamin\./);
  assert.match(homeIntro[1], /M\.Sc\. in Mathematics in Science and Engineering at TUM/);
  assert.match(homeIntro[3], /PhD positions\.$/);

  /*
   * The wording the CV and the GitHub profile use. If any of it reappears here
   * the page has drifted back to repeating the other two surfaces, which is the
   * thing this copy was written to stop.
   */
  const cvPhrases = [
    "I build machine learning systems and the services that run them",
    "added calibrated confidence estimates to a graph neural network",
    "I measure what a model gets wrong as carefully as what it gets right",
    "retrieval services over vector and graph databases",
  ];
  const joined = homeIntro.join(" ");
  for (const phrase of cvPhrases) {
    assert.ok(!joined.includes(phrase), `home intro repeats CV wording: ${phrase}`);
  }
});

test("the AUDI card describes the release tracking tool", () => {
  const audi = selectedWork.find((card) => card.name.includes("AUDI"));
  assert.ok(audi, "no AUDI card on the home page");
  assert.match(audi.what, /Excel VBA/);
  assert.match(audi.what, /UserForms/);
  assert.match(audi.what, /600 rows/);
  assert.match(audi.what, /130 or more columns/);
  assert.match(audi.result, /German and Chinese/);
  assert.match(audi.result, /FREIPRO/);
  assert.match(audi.result, /write-back/);
});

test("every work card has a real name, one result and tools", () => {
  for (const card of selectedWork) {
    assert.ok(card.name.length > 2, `card has no name: ${JSON.stringify(card)}`);
    /*
     * A name, not a sentence about the work. The cards this replaced were
     * headed "Keeping derived state honest" and similar, which a reader cannot
     * match to anything on a CV or a GitHub profile.
     */
    assert.ok(!card.name.endsWith("."), `card name reads as a sentence: ${card.name}`);
    assert.ok(!card.name.includes("?"), `card name is a question: ${card.name}`);
    assert.ok(card.what.trim().length >= 40, `card "${card.name}" has no description`);
    assert.ok(card.result.trim().length >= 20, `card "${card.name}" has no result`);
    assert.ok(card.tech.length > 0, `card "${card.name}" lists no tools`);
    assert.ok(card.href.length > 1, `card "${card.name}" has no link`);
  }
});

test("the weak practice projects are not on the home page", () => {
  const names = selectedWork.map((card) => card.name.toLowerCase());
  for (const dropped of ["cifar", "streamflow"]) {
    assert.ok(
      !names.some((name) => name.includes(dropped)),
      `${dropped} is back on the home page; it belongs on /work only`,
    );
  }
});

test("the work order is the one the owner set", () => {
  const order = selectedWork.map((card) => card.name);
  assert.deepEqual(order, [
    "Master's Thesis: Uncertainty for a Traffic GNN",
    "Legal Knowledge Base",
    "AI Radiologist",
    "Document Extraction",
    "MCP Policy Gateway",
    "InsureAssist",
    "AUDI Release Tracking Tool",
    "Uncertainty in a Hydrological Model",
    "Identification of Neural Networks",
    "MLOps Pipeline",
  ]);
});

test("BP-IT carries no dates and nothing is marked current", () => {
  const bpit = homeExperience.find((role) => role.organisation.startsWith("BP-IT"));
  assert.ok(bpit, "no BP-IT role");
  assert.ok(!("period" in bpit && bpit.period), "BP-IT must publish no dates on the website");

  for (const role of homeExperience) {
    const text = `${role.role} ${role.period ?? ""}`;
    assert.ok(!/present|now|current/i.test(text), `${role.organisation} is marked current`);
  }
});

test("experience covers the four CV roles with plain bullets", () => {
  assert.equal(homeExperience.length, 4);
  const orgs = homeExperience.map((r) => r.organisation);
  assert.ok(orgs.includes("BP-IT Consulting & Solutions GmbH"));
  assert.ok(orgs.includes("AUDI AG"));
  assert.equal(orgs.filter((o) => o === "Technical University of Munich").length, 2);

  for (const role of homeExperience) {
    assert.ok(role.bullets.length >= 2 && role.bullets.length <= 3,
      `${role.organisation} should carry two or three bullets, has ${role.bullets.length}`);
  }
});

test("education states both degrees and that the M.Sc. is completed", () => {
  assert.equal(homeEducation.length, 2);
  const [msc, bsc] = homeEducation;
  assert.equal(msc.credential, "M.Sc. Mathematics in Science and Engineering");
  assert.equal(msc.year, "2026");
  assert.match(msc.note, /Completed/);
  assert.match(bsc.credential, /B\.Sc\. \(Hons\.\) Mathematics/);
  assert.equal(bsc.year, "2021");
});

test("the research figures are plain and carry no trial or Greek names", () => {
  assert.equal(researchHighlights.length, 3);
  const all = researchHighlights.map((h) => `${h.figure} ${h.plain}`).join(" ");
  assert.match(all, /82%/);
  assert.match(all, /41%/);
  assert.match(all, /90\.02%/);
  assert.match(all, /95\.01%/);

  /* These belong on /research/thesis, with their protocol, and nowhere else. */
  for (const jargon of ["Trial 8", "rho", "Spearman", "MC Dropout", "ECE", "sigma"]) {
    assert.ok(!all.includes(jargon), `home research section mentions ${jargon}`);
  }
});

test("skills are grouped and non-empty", () => {
  assert.ok(homeSkills.length >= 4);
  for (const group of homeSkills) {
    assert.ok(group.items.length > 0, `skill group "${group.group}" is empty`);
  }
});

test("the photographer credit is still carried", () => {
  assert.equal(portraitCredit, "Photo: Davies");
});
