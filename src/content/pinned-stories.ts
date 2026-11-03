import { gatewaySource } from "./gateway-world";

/**
 * The argument beside each pinned architecture diagram.
 *
 * Written under the same rules as `case-stories.ts`: no number appears here, a step says what the
 * system does and why, and the caveat sits inside the argument. Every sentence restates something
 * the project's own page or repository already says.
 */

export interface PinnedStory {
  title: string;
  intro: string;
  beats: readonly { verb: string; text: string }[];
  caveat: string;
  link: { href: string; label: string };
}

export const pinnedStories = {
  medico: {
    title: "What to do with a label nobody gave",
    intro:
      "The hard part of this prototype is not the network. Three corpora disagree about what they can label, and the training has to respect that.",
    beats: [
      {
        verb: "Problem",
        text: "Only one of the three sources can speak to every finding. The others are silent on most of them, and silence is not a negative.",
      },
      {
        verb: "Mask",
        text: "An entry a corpus cannot label is masked, so it contributes nothing to the loss and nothing to the metrics.",
      },
      {
        verb: "Weight",
        text: "What remains goes through a focal loss, normalised by the mask and the weights, so a heavily masked batch is not scaled as though it had been learned from.",
      },
      {
        verb: "Split",
        text: "Images are split by patient rather than by image, so two views of one person cannot land on both sides.",
      },
      {
        verb: "Select",
        text: "The checkpoint is chosen on the minimum class AUC, because a mean would let a strong majority class hide a finding the model cannot do at all.",
      },
    ],
    caveat:
      "A research prototype and not a clinical one. It must not be used for diagnosis, triage, treatment decisions or any other clinical purpose, and nothing here is a medical claim.",
    link: { href: "https://github.com/mzquadri/medico", label: "Inspect repository" },
  },

  "reliable-knowledge-systems": {
    title: "One capture, checked from the far end",
    intro:
      "Several derived views of one source exist at the same time, and each is good at something the others are bad at. The engineering question is whether they still agree with what they were built from.",
    beats: [
      {
        verb: "Problem",
        text: "Derived views are disposable. The captured evidence is not: it is what they are checked against, and the only part that cannot be regenerated.",
      },
      {
        verb: "Derive",
        text: "One capture is projected into forms with different jobs. Records answer exactly, a semantic index answers approximately, and a graph keeps structure that flat records lose.",
      },
      {
        verb: "Compare",
        text: "Checking the derived forms against each other finds disagreement without identifying who is wrong.",
      },
      {
        verb: "Verify",
        text: "So the check runs backwards, asking each derived view whether it still agrees with the capture. The answer is a conjunction rather than a light.",
      },
    ],
    caveat:
      "This is a synthetic model. It is illustrative throughout and describes no deployed system.",
    link: { href: "/architecture", label: "The same work, named" },
  },

  "mcp-policy-gateway": {
    title: "Three moments a client has to trust",
    intro:
      "An MCP client trusts the tool declarations a server publishes, the arguments a model builds and the content a tool returns, each at a different time.",
    beats: [
      {
        verb: "Problem",
        text: "A tool description and a tool result are both prose that ends up in front of the model, which has no reliable way to tell a sentence describing data from one instructing it.",
      },
      {
        verb: "Relay",
        text: "The downstream tool list is relayed with declarations that carry instructions withheld or stripped.",
      },
      {
        verb: "Check",
        text: "Arguments are checked against the schema the server itself published, then the call is forwarded, refused, or held for a human if its effects cannot be undone.",
      },
      {
        verb: "Inspect",
        text: "Returned content is inspected before it is read back into the model's context.",
      },
      {
        verb: "Record",
        text: "Each decision is recorded with the rules that fired and the timing, without copying the payload.",
      },
    ],
    caveat:
      "Paraphrase defeats pattern matching, so the headline is an upper bound against the attack forms represented. The corpus is mine, which is not the same as an independent evaluation.",
    link: { href: gatewaySource.repository, label: "Inspect repository" },
  },
} as const satisfies Record<string, PinnedStory>;
