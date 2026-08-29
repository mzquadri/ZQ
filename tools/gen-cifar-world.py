"""
Generate src/content/cifar-world.ts from the experiment's tracked artifacts.

What is real here, and what is not, matters more on this project than on the others, so it is
stated plainly:

  REAL - the architecture and every tensor shape, obtained by building the repository's own
         nn.Module and pushing a tensor through it with forward hooks;
  REAL - the parameter count, checked against the tracked 815,018;
  REAL - every metric, from results/*.json and the classification report;
  REAL - the full 10x10 confusion matrix, transcribed from the tracked figure and then verified
         four ways: every row must sum to 1,000, every diagonal must equal the tracked per-class
         accuracy, the trace must give exactly 64.26%, and every column must reproduce the
         precision in the classification report. The script refuses to emit if any check fails;
  REAL - the sample images, which are actual CIFAR-10 test images at their native 32x32;
  ABSENT - activations and per-image predictions. The repository deliberately does not version a
         checkpoint, so there are no learned weights to run. Nothing here invents a feature map
         or a softmax, and the decision state uses the confusion matrix's own row instead.

Requires torch, torchvision. Downloads CIFAR-10 once into a cache beside this script.

Run:  python tools/gen-cifar-world.py
"""

import base64
import io
import json
import os
import urllib.request

CACHE = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".cifar-cache")
REPO = "https://github.com/mzquadri/CNN-Image-Classification-PyTorch"
RAW = "https://raw.githubusercontent.com/mzquadri/CNN-Image-Classification-PyTorch/main"

CLASSES = ["airplane", "automobile", "bird", "cat", "deer",
           "dog", "frog", "horse", "ship", "truck"]

# Which classes are vehicles. Used only to group the results; it is a fact about the
# label set, not a claim about the model.
VEHICLES = {"airplane", "automobile", "ship", "truck"}


def fetch(path):
    os.makedirs(CACHE, exist_ok=True)
    local = os.path.join(CACHE, path.replace("/", "_"))
    if not os.path.exists(local):
        with urllib.request.urlopen(RAW + "/" + path) as r:
            data = r.read()
        with open(local, "wb") as f:
            f.write(data)
    return io.open(local, encoding="utf-8").read()


test_results = json.loads(fetch("results/test_results.json"))
hyper = json.loads(fetch("results/hyperparameters.json"))
history = json.loads(fetch("results/training_history.json"))
report = fetch("results/classification_report.txt")

# ---------------------------------------------------------------------------
# The confusion matrix, read off results/figures/02_confusion_matrix.png.
# Rows are the true class, columns the predicted class, in CLASSES order.
# ---------------------------------------------------------------------------

CM = [
    [730, 38, 57, 5, 9, 6, 19, 19, 88, 29],
    [14, 820, 1, 2, 2, 3, 10, 10, 11, 127],
    [111, 9, 353, 67, 113, 123, 133, 53, 16, 22],
    [20, 13, 58, 335, 37, 291, 145, 39, 26, 36],
    [40, 8, 70, 37, 469, 45, 170, 147, 10, 4],
    [13, 5, 49, 139, 50, 605, 38, 76, 10, 15],
    [9, 0, 22, 59, 54, 17, 816, 7, 10, 6],
    [9, 3, 18, 26, 55, 114, 17, 728, 1, 29],
    [109, 59, 11, 9, 0, 7, 10, 3, 763, 29],
    [31, 104, 2, 6, 1, 5, 13, 17, 14, 807],
]

# Precision as printed in the classification report, for the fourth check.
REPORT_PRECISION = {"airplane": 0.67, "automobile": 0.77, "bird": 0.55, "cat": 0.49,
                    "deer": 0.59, "dog": 0.50, "frog": 0.60, "horse": 0.66,
                    "ship": 0.80, "truck": 0.73}
REPORT_RECALL = {"airplane": 0.73, "automobile": 0.82, "bird": 0.35, "cat": 0.34,
                 "deer": 0.47, "dog": 0.60, "frog": 0.82, "horse": 0.73,
                 "ship": 0.76, "truck": 0.81}

per_class = test_results["per_class_accuracy"]

print("verifying the transcribed confusion matrix")
for i, c in enumerate(CLASSES):
    total = sum(CM[i])
    assert total == 1000, "row %s sums to %d, not 1000" % (c, total)
    assert abs(CM[i][i] / 10.0 - per_class[c]) < 1e-9, (
        "diagonal for %s is %.2f%% but test_results.json says %.2f%%"
        % (c, CM[i][i] / 10.0, per_class[c]))
trace = sum(CM[i][i] for i in range(10))
assert abs(trace / 100.0 - test_results["test_accuracy"]) < 1e-9, (
    "trace gives %.2f%% but the tracked accuracy is %.2f%%"
    % (trace / 100.0, test_results["test_accuracy"]))
predicted_counts = [sum(CM[i][j] for i in range(10)) for j in range(10)]
for j, c in enumerate(CLASSES):
    prec = CM[j][j] / predicted_counts[j]
    assert abs(round(prec, 2) - REPORT_PRECISION[c]) <= 0.005, (
        "precision for %s derives as %.4f but the report says %.2f"
        % (c, prec, REPORT_PRECISION[c]))
print("  rows sum to 1,000, diagonals match, trace is %.2f%%, every precision agrees"
      % (trace / 100.0))

# ---------------------------------------------------------------------------
# The architecture, built and measured rather than described.
# ---------------------------------------------------------------------------

import torch  # noqa: E402
import torch.nn as nn  # noqa: E402


class CIFAR10CNN(nn.Module):
    """src/model.py, verbatim."""

    def __init__(self, num_classes=10, dropout=0.25):
        super().__init__()
        self.conv_block1 = nn.Sequential(
            nn.Conv2d(3, 32, kernel_size=3, padding=1), nn.BatchNorm2d(32), nn.ReLU(inplace=True),
            nn.Conv2d(32, 32, kernel_size=3, padding=1), nn.BatchNorm2d(32), nn.ReLU(inplace=True),
            nn.MaxPool2d(2, 2), nn.Dropout2d(dropout))
        self.conv_block2 = nn.Sequential(
            nn.Conv2d(32, 64, kernel_size=3, padding=1), nn.BatchNorm2d(64), nn.ReLU(inplace=True),
            nn.Conv2d(64, 64, kernel_size=3, padding=1), nn.BatchNorm2d(64), nn.ReLU(inplace=True),
            nn.MaxPool2d(2, 2), nn.Dropout2d(dropout))
        self.conv_block3 = nn.Sequential(
            nn.Conv2d(64, 128, kernel_size=3, padding=1), nn.BatchNorm2d(128), nn.ReLU(inplace=True),
            nn.Conv2d(128, 128, kernel_size=3, padding=1), nn.BatchNorm2d(128), nn.ReLU(inplace=True),
            nn.MaxPool2d(2, 2), nn.Dropout2d(dropout))
        self.classifier = nn.Sequential(
            nn.Flatten(), nn.Linear(128 * 4 * 4, 256), nn.ReLU(inplace=True),
            nn.Dropout(0.5), nn.Linear(256, num_classes))

    def forward(self, x):
        x = self.conv_block1(x)
        x = self.conv_block2(x)
        x = self.conv_block3(x)
        return self.classifier(x)


model = CIFAR10CNN()
n_params = sum(p.numel() for p in model.parameters() if p.requires_grad)
assert n_params == test_results["n_parameters"], (
    "built model has %d parameters but the run recorded %d"
    % (n_params, test_results["n_parameters"]))
print("  built model has %s parameters, matching the tracked run" % f"{n_params:,}")

# Real tensor shapes, taken with hooks rather than read off the README.
stages = []
hooks = []


def record(name):
    def hook(_m, _inp, out):
        stages.append({"name": name, "shape": list(out.shape[1:]),
                       "params": None})
    return hook


for name, block in [("Conv block 1", model.conv_block1),
                    ("Conv block 2", model.conv_block2),
                    ("Conv block 3", model.conv_block3),
                    ("Classifier", model.classifier)]:
    hooks.append(block.register_forward_hook(record(name)))

model.eval()
with torch.no_grad():
    model(torch.zeros(1, 3, 32, 32))
for h in hooks:
    h.remove()

block_params = {
    "Conv block 1": sum(p.numel() for p in model.conv_block1.parameters()),
    "Conv block 2": sum(p.numel() for p in model.conv_block2.parameters()),
    "Conv block 3": sum(p.numel() for p in model.conv_block3.parameters()),
    "Classifier": sum(p.numel() for p in model.classifier.parameters()),
}
for s in stages:
    s["params"] = block_params[s["name"]]

print("  shapes: 3x32x32 -> " + " -> ".join(
    "x".join(str(d) for d in s["shape"]) for s in stages))

# ---------------------------------------------------------------------------
# Real CIFAR-10 test images. The dataset is public; these are the actual pixels.
# ---------------------------------------------------------------------------

from torchvision import datasets  # noqa: E402

ds = datasets.CIFAR10(root=os.path.join(CACHE, "data"), train=False, download=True)

# Deterministic: the first test image of each chosen class, in dataset order.
WANTED = ["cat", "dog", "automobile"]
picked = {}
for idx in range(len(ds)):
    img, label = ds[idx]
    name = CLASSES[label]
    if name in WANTED and name not in picked:
        picked[name] = (idx, img)
    if len(picked) == len(WANTED):
        break

from PIL import Image  # noqa: E402


def to_data_uri(img):
    buf = io.BytesIO()
    img.save(buf, format="PNG", optimize=True)
    return "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode("ascii")


def to_rows(img):
    px = list(img.getdata())
    return [[px[r * 32 + c] for c in range(32)] for r in range(32)]


primary_idx, primary_img = picked["cat"]
primary_rows = to_rows(primary_img)
print("  sample images: " + ", ".join(
    "%s #%d" % (k, picked[k][0]) for k in WANTED))


def num(v, places=4):
    s = ("%." + str(places) + "f") % v
    if "." in s:
        s = s.rstrip("0").rstrip(".")
    return s if s not in ("", "-") else "0"


# ---------------------------------------------------------------------------
# Derived structure. Each of these is arithmetic on the verified matrix.
# ---------------------------------------------------------------------------

net_flow = [{"cls": c, "predicted": predicted_counts[j], "net": predicted_counts[j] - 1000}
            for j, c in enumerate(CLASSES)]

pairs = sorted(((CM[i][j], CLASSES[i], CLASSES[j])
                for i in range(10) for j in range(10) if i != j), reverse=True)

vehicle_acc = sum(per_class[c] for c in CLASSES if c in VEHICLES) / len(VEHICLES)
animal_acc = sum(per_class[c] for c in CLASSES if c not in VEHICLES) / (10 - len(VEHICLES))

# How often a mistake stays inside its own group. A fact about the matrix.
def group(c):
    return "vehicle" if c in VEHICLES else "animal"


within = 0
across = 0
for i, a in enumerate(CLASSES):
    for j, b in enumerate(CLASSES):
        if i == j:
            continue
        if group(a) == group(b):
            within += CM[i][j]
        else:
            across += CM[i][j]

best = max(CLASSES, key=lambda c: per_class[c])
worst = min(CLASSES, key=lambda c: per_class[c])

print()
print("  vehicles average %.1f%%, animals %.1f%%" % (vehicle_acc, animal_acc))
print("  %d of %d mistakes stay inside the same group (%.1f%%)"
      % (within, within + across, 100.0 * within / (within + across)))
print("  largest confusion: %s -> %s, %d" % (pairs[0][1], pairs[0][2], pairs[0][0]))

L = []
w = L.append
w("/*")
w(" * GENERATED by tools/gen-cifar-world.py - do not edit by hand.")
w(" *")
w(" * CIFAR-10 CNN reference experiment.")
w(" * " + REPO)
w(" *")
w(" * Shapes and the parameter count are measured by building the repository's own nn.Module and")
w(" * running a tensor through it. The confusion matrix is transcribed from the tracked figure and")
w(" * verified four ways before this file is written. The sample images are real CIFAR-10 test")
w(" * images at native resolution.")
w(" *")
w(" * There are no activations and no per-image predictions here, because the repository")
w(" * deliberately does not version a checkpoint. Nothing in this module is a guess at what the")
w(" * trained model would have produced.")
w(" */")
w("")
w("export const project = {")
w('  repository: "' + REPO + '",')
w('  dataset: "CIFAR-10",')
w("  classes: " + str(len(CLASSES)) + ",")
w('  imageSize: "32 x 32 RGB",')
w("  inputNumbers: " + str(3 * 32 * 32) + ",")
w('  architecture: "' + hyper["architecture"] + '",')
w("  parameters: " + str(n_params) + ",")
w("  trainingSubset: 15000,")
w("  datasetTrain: 50000,")
w("  testImages: 10000,")
w("} as const;")
w("")
w("export const classNames = [")
for c in CLASSES:
    w('  "' + c + '",')
w("] as const;")
w("")
w("/** Training configuration, from results/hyperparameters.json. */")
w("export const training = {")
w("  epochs: " + str(hyper["max_epochs"]) + ",")
w("  batchSize: " + str(hyper["batch_size"]) + ",")
w("  learningRate: " + num(hyper["learning_rate"], 4) + ",")
w('  optimizer: "' + hyper["optimizer"] + '",')
w('  scheduler: "' + hyper["scheduler"] + '",')
w("  weightDecay: " + num(hyper["weight_decay"], 5) + ",")
w("  dropout: " + num(hyper["dropout"], 2) + ",")
w("  augmentation: [" + ", ".join('"' + a + '"' for a in hyper["augmentation"]) + "],")
w("  timeSeconds: " + num(test_results["training_time_s"], 1) + ",")
w("} as const;")
w("")
w("/** Headline result, from results/test_results.json. */")
w("export const result = {")
w("  testAccuracy: " + num(test_results["test_accuracy"], 2) + ",")
w("  testLoss: " + num(test_results["test_loss"], 3) + ",")
w("  bestValAccuracy: " + num(test_results["best_val_accuracy"], 2) + ",")
w("  bestEpoch: " + str(test_results["best_epoch"]) + ",")
w("  finalTrainAccuracy: " + num(history["train_acc"][-1], 2) + ",")
w("  finalValLoss: " + num(history["val_loss"][-1], 4) + ",")
w('  source: "results/test_results.json",')
w("} as const;")
w("")
w("/** The stages, with shapes taken from the built module rather than the README. */")
w("export const stages = [")
w('  { name: "Input", shape: [3, 32, 32], params: 0 },')
for s in stages:
    w('  { name: "' + s["name"] + '", shape: [' + ", ".join(str(d) for d in s["shape"])
      + "], params: " + str(s["params"]) + " },")
w("] as const;")
w("")
w("/** Per-class results. Accuracy is recall; precision is derived from the matrix. */")
w("export const perClass = [")
for j, c in enumerate(CLASSES):
    prec = CM[j][j] / predicted_counts[j]
    w("  {")
    w('    cls: "' + c + '",')
    w('    group: "' + group(c) + '",')
    w("    accuracy: " + num(per_class[c], 1) + ",")
    w("    precision: " + num(prec, 4) + ",")
    w("    predicted: " + str(predicted_counts[j]) + ",")
    w("    net: " + str(predicted_counts[j] - 1000) + ",")
    w("  },")
w("] as const;")
w("")
w("/** The full matrix. Rows are the true class, columns the predicted class. */")
w("export const confusion = [")
for row in CM:
    w("  [" + ", ".join(str(v) for v in row) + "],")
w("] as const;")
w('export const confusionSource = "results/figures/02_confusion_matrix.png" as const;')
w("")
w("/** The largest off-diagonal cells, in order. */")
w("export const topConfusions = [")
for v, a, b in pairs[:6]:
    w('  { from: "' + a + '", to: "' + b + '", count: ' + str(v) + " },")
w("] as const;")
w("")
w("/** What the matrix says about the label set as a whole. */")
w("export const structure = {")
w("  vehicleAccuracy: " + num(vehicle_acc, 1) + ",")
w("  animalAccuracy: " + num(animal_acc, 1) + ",")
w("  withinGroupErrors: " + str(within) + ",")
w("  acrossGroupErrors: " + str(across) + ",")
w("  withinGroupShare: " + num(within / (within + across), 4) + ",")
w('  best: "' + best + '",')
w("  bestAccuracy: " + num(per_class[best], 1) + ",")
w('  worst: "' + worst + '",')
w("  worstAccuracy: " + num(per_class[worst], 1) + ",")
w("  spread: " + num(per_class[best] - per_class[worst], 1) + ",")
w("} as const;")
w("")
w("/** Per-epoch history, from results/training_history.json. */")
w("export const history = [")
for i in range(len(history["train_acc"])):
    w("  { epoch: " + str(i + 1)
      + ", trainAcc: " + num(history["train_acc"][i], 2)
      + ", valAcc: " + num(history["val_acc"][i], 2)
      + ", trainLoss: " + num(history["train_loss"][i], 4)
      + ", valLoss: " + num(history["val_loss"][i], 4)
      + ", lr: " + num(history["lr"][i], 8) + " },")
w("] as const;")
w("")
w("/**")
w(" * Real CIFAR-10 test images, at their native 32x32.")
w(" *")
w(" * The primary sample is a cat because cat is the story: the weakest class in the run, and the")
w(" * source of the largest single confusion in the matrix. These are the dataset's pixels, not an")
w(" * illustration of them, and they are not upscaled.")
w(" */")
w("export const samples = [")
for name in WANTED:
    idx, img = picked[name]
    w("  {")
    w('    cls: "' + name + '",')
    w("    index: " + str(idx) + ",")
    w('    dataUri: "' + to_data_uri(img) + '",')
    w("  },")
w("] as const;")
w("")
w("/** The primary sample as rows of [r, g, b], for the pixel field. */")
w("export const primary = {")
w('  cls: "cat",')
w("  index: " + str(primary_idx) + ",")
w("  rows: [")
for r in primary_rows:
    w("    [" + ", ".join("[%d,%d,%d]" % p for p in r) + "],")
w("  ],")
w("} as const;")
w("")
w("/** Where the 1,000 real cats in the test set actually went. The matrix's own row. */")
w("export const primaryRow = [")
cat_i = CLASSES.index("cat")
for j, c in enumerate(CLASSES):
    w('  { cls: "' + c + '", count: ' + str(CM[cat_i][j]) + " },")
w("] as const;")
w("")
w("export const limits = [")
LIMITS = [
    ("A bounded educational baseline",
     "15,000 of the 50,000 training images and twelve epochs on a laptop GPU. It is not a state-of-the-art result and the repository does not present it as one."),
    ("No checkpoint, so no activations",
     "The run's weights are deliberately not versioned. Every feature map in this world is drawn from the architecture's real shapes; none is a recorded activation, and no prediction is shown for any individual image."),
    ("The run had not converged",
     "Validation loss was still falling at the final epoch and training accuracy was still below validation accuracy. Twelve epochs was a budget, not a stopping criterion."),
    ("The aggregate is the least useful number",
     "64.26% is the mean of a 48.5-point spread, from 33.5% on cat to 82.0% on automobile. Quoting it alone describes almost nothing about the model's behaviour."),
    ("The matrix was read from a figure",
     "Only the confusion figure is tracked, not its underlying array. It was transcribed and then checked against the per-class accuracies, the trace and every precision in the classification report before being used."),
    ("One run, one seed",
     "A single reference run. Nothing here establishes variance across seeds or across repeated training."),
]
for label, note in LIMITS:
    w('  { label: "' + label + '", note: "' + note + '" },')
w("] as const;")
w("")

NL = chr(10)
io.open("src/content/cifar-world.ts", "w", encoding="utf-8", newline=NL).write(NL.join(L))

# ---------------------------------------------------------------------------
# The homepage chapter's share.
# ---------------------------------------------------------------------------

CH = []
c = CH.append
c("/*")
c(" * GENERATED by tools/gen-cifar-world.py - do not edit by hand.")
c(" *")
c(" * The homepage chapter's share of the CIFAR evidence. See cifar-world.ts for the full set.")
c(" */")
c("")
c("export const chapter = {")
c("  testAccuracy: " + num(test_results["test_accuracy"], 2) + ",")
c('  best: "' + best + '",')
c("  bestAccuracy: " + num(per_class[best], 1) + ",")
c('  worst: "' + worst + '",')
c("  worstAccuracy: " + num(per_class[worst], 1) + ",")
c('  topFrom: "' + pairs[0][1] + '",')
c('  topTo: "' + pairs[0][2] + '",')
c("  topCount: " + str(pairs[0][0]) + ",")
c("} as const;")
c("")
c("/** Per-class accuracy, for the chapter's ten bars. */")
c("export const chapterClasses = [")
for cls in CLASSES:
    c('  { cls: "' + cls + '", accuracy: ' + num(per_class[cls], 1)
      + ', group: "' + group(cls) + '" },')
c("] as const;")
c("")
c('export const chapterSample = "' + to_data_uri(primary_img) + '" as const;')
c("")
io.open("src/content/cifar-chapter.ts", "w", encoding="utf-8", newline=NL).write(NL.join(CH))

print()
print("wrote src/content/cifar-world.ts and src/content/cifar-chapter.ts")
