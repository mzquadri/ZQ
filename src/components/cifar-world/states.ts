import { choreograph, type WorldState } from "@/components/worlds/choreography";

/**
 * A small image, taken apart, and then ten thousand of them.
 *
 * The first half is the machine: 3,072 numbers arriving as a 32x32 plate, a 3x3 window moving over
 * it, and a stack that contracts in space while it widens in channels until 2,048 numbers reach a
 * classifier. The second half is what that machine does to a whole test set, which is where the
 * project's real content is - a 64.26% aggregate covering a 48.5-point spread, and a confusion
 * structure that separates vehicles from animals well and animals from each other badly.
 *
 * Deliberately not a feature-map light show. There is no checkpoint in the repository, so there
 * are no recorded activations to draw and nothing here pretends otherwise: the planes carry the
 * architecture's real shapes, and the decision state carries the confusion matrix's own row rather
 * than an invented softmax.
 *
 * Kept away from the medico world on purpose. That one is about label semantics and clinical
 * uncertainty over a pretrained backbone; this one is about spatial structure and where a
 * ten-class boundary actually fails. Different axis, different camera, different payload.
 */

export type CifarKey =
  | "image"
  | "pixels"
  | "augment"
  | "field"
  | "features"
  | "compress"
  | "classifier"
  | "decision"
  | "spread"
  | "confusion"
  | "structure"
  | "limits";

export const STATES: readonly WorldState<CifarKey>[] = [
  {
    key: "image",
    from: 0.0,
    to: 0.07,
    label: "One image",
    caption: "A CIFAR-10 test image, at the size the network actually receives it.",
  },
  {
    key: "pixels",
    from: 0.07,
    to: 0.15,
    label: "Three thousand numbers",
    caption: "32 by 32 by 3. That is the entire input. No more information arrives.",
  },
  {
    key: "augment",
    from: 0.15,
    to: 0.22,
    label: "Made harder on purpose",
    caption: "Crop with padding, horizontal flip, colour jitter. The same image, never twice.",
  },
  {
    key: "field",
    from: 0.22,
    to: 0.3,
    label: "A three-by-three window",
    caption: "Each output value sees nine input pixels. Locality is the whole assumption.",
  },
  {
    key: "features",
    from: 0.3,
    to: 0.38,
    label: "Thirty-two channels",
    caption: "One plate becomes thirty-two, each half the width. Shapes are real; values are not.",
  },
  {
    key: "compress",
    from: 0.38,
    to: 0.47,
    label: "Narrower, then deeper",
    caption: "32 to 16 to 8 to 4 in space, while channels go 3 to 32 to 64 to 128.",
  },
  {
    key: "classifier",
    from: 0.47,
    to: 0.55,
    label: "Two thousand into ten",
    caption: "The volume flattens to 2,048, passes through 256, and lands on ten numbers.",
  },
  {
    key: "decision",
    from: 0.55,
    to: 0.64,
    label: "Where the cats went",
    caption: "Not one prediction. All 1,000 test cats, and the bins they actually landed in.",
  },
  {
    key: "spread",
    from: 0.64,
    to: 0.73,
    label: "The average of what?",
    caption: "64.26% overall. Per class it runs from 33.5 to 82.0.",
  },
  {
    key: "confusion",
    from: 0.73,
    to: 0.82,
    label: "The largest single mistake",
    caption: "291 cats were called dog. The model is right about cats only 335 times.",
  },
  {
    key: "structure",
    from: 0.82,
    to: 0.91,
    label: "Two groups, not ten classes",
    caption: "Vehicles are nearly solved. Animals are where almost every error lives.",
  },
  {
    key: "limits",
    from: 0.91,
    to: 1.0,
    label: "What was actually run",
    caption: "A 15,000-image subset, twelve epochs, and a run that had not finished improving.",
  },
];

const readers = choreograph(STATES);
export const at = readers.at;
export const active = readers.active;

/**
 * Camera keyframes.
 *
 * The network runs along Z, into the screen, and `dolly` pushes the camera down that axis - so the
 * move here is travelling *through* the stack rather than around it. Every other world on this
 * site uses X as its main axis and orbits or tracks sideways; this one is the only one that goes
 * in, which is the right verb for something that starts at one 32-pixel plate and ends inside it.
 *
 * `tilt` lifts off the axis so the channel depth reads once there is depth to read, and `zoom`
 * is a separate distance.
 *
 * The opening distances are set so the whole 32-pixel plate fits the frame. An earlier pass put
 * the camera close enough that the tiles filled the screen, which showed the texture of the
 * explosion but lost the two things that actually matter here: that it is one small image, and
 * that there are only 32 of them across.
 */
export const SHOTS: Record<
  CifarKey,
  { dolly: number; tilt: number; zoom: number; height: number }
> = {
  image: { dolly: 0.0, tilt: 0.02, zoom: 5.6, height: 0.0 },
  pixels: { dolly: 0.3, tilt: 0.12, zoom: 5.1, height: 0.2 },
  augment: { dolly: 0.2, tilt: 0.05, zoom: 9.6, height: 0.1 },
  field: { dolly: 0.6, tilt: 0.12, zoom: 3.6, height: 0.2 },
  features: { dolly: -1.2, tilt: 0.6, zoom: 6.4, height: 0.9 },
  compress: { dolly: -3.6, tilt: 0.82, zoom: 9.2, height: 1.6 },
  classifier: { dolly: -6.4, tilt: 0.72, zoom: 7.2, height: 1.2 },
  decision: { dolly: -8.4, tilt: 0.16, zoom: 5.2, height: 0.6 },
  spread: { dolly: -8.4, tilt: 0.22, zoom: 6.6, height: 1.0 },
  confusion: { dolly: -8.4, tilt: 0.5, zoom: 7.2, height: 1.6 },
  structure: { dolly: -8.4, tilt: 0.44, zoom: 7.8, height: 1.5 },
  limits: { dolly: -6.0, tilt: 0.28, zoom: 9.4, height: 1.2 },
};
