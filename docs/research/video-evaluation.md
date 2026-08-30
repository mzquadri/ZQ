# Animation and video suitability, per flagship

Written after the eight procedural scenes shipped, because the earlier rebuild adopted the video
references' *rhythm* without ever writing down whether their *medium* was worth adopting anywhere.

The question for each chapter is narrow: does a pre-rendered sequence buy something the live
Canvas scene cannot, at a cost worth paying? The reference videos use rendered footage because
their subject is a product that has to look expensive. Every subject here is a measurement, and a
measurement drawn at runtime from its own evidence module cannot drift from that evidence — a
rendered file can, the moment either changes.

## The costs that apply to all eight

Any video added here would carry the same overheads:

- **Bytes.** The current reel ships **zero media**. A 5-second 1280×720 sequence, even at a modest
  bitrate, is 300–800 KB per chapter; eight would be several megabytes against a homepage whose
  entire initial transfer is 574 KB.
- **Truth drift.** A scene's numbers come from its content module at render time. A video freezes
  them. When a repository is re-audited — as transport was, gaining a baseline table that changed
  the chapter's conclusion — the scene follows and the file does not.
- **A second reduced-motion path.** Scenes already resolve to a server-rendered SVG at their
  resting composition. A video needs a poster, and that poster is a third artifact to keep in step.
- **Resolution.** Scenes are vector at any DPR. A video is fixed, and the site is read at 320 to
  1440 and beyond.

## Per project

| Project | Current live motion | What a video could add | Cost | Mobile value | Reduced motion | Decision |
|---|---|---|---|---|---|---|
| **Transport** | Canvas: network lifts into hop-distance depth, uncertainty bands grow, reliability inset crosses to the diagonal | Depth of field and a smoother camera on the lift | ~600 KB; the calibration numbers would be baked into pixels | None — the portrait scene already restacks | Would need a poster; the SVG still already is one | **No video** |
| **RKS** | Canvas: orthogonal stores, routed verification, one view drifts, detaches, rebuilds | Nothing. The point is that the core does not move, which is easier to *prove* in a scene a reader can scrub back and forth | ~500 KB | None | Already complete | **No video** |
| **Medico** | Canvas: contoured film, 3×14 coverage matrix, masking, backbone, empty outputs | A film-to-mask dissolve would look good | ~500 KB, and the risk is real: a rendered medical dissolve is exactly the "glowing interface" this project must not imply | None | Already complete | **No video** |
| **InsureAssist** | Canvas: three identical documents, ranked list, the trace to the wrong form | Very little. The finding is a comparison held still, not a motion | ~500 KB | None | Already complete | **No video** |
| **MLOps** | Canvas: one artifact along a rail, four gate plates, refusal, promotion | A rendered artifact with material and shadow | ~700 KB, and the staged refusal is the one state that must be unmistakably labelled — harder to caption inside a video | None | Already complete | **No video** |
| **Hydrology** | Canvas: fitted rating curve, one ruler interval projected at two stages | The strongest candidate. A slow sweep of the same ±25 cm along the curve, watching the discharge band open from 8.6 to 338, would show the amplification as continuous rather than sampled at two points | ~600 KB. But this is *scroll-scrubbable*, and scrubbing lets a reader move the interval themselves | Real, if it replaced the two-point comparison | Poster needed | **No video** — the sweep is worth building, but as a scene beat, not a file |
| **Streamflow** | Canvas: ribbon, magnified window, features, prediction over observation, importance bars | A zoom from fifteen years into 120 days | ~600 KB | None | Already complete | **No video** |
| **CIFAR** | Canvas: confusion matrix, block reordering, per-class fan, headline drawn across it | 32×32 pixels travelling through measured tensor shapes would be attractive | ~700 KB, and the repository publishes no checkpoint, so any per-image movement risks implying activations that do not exist | None | Already complete | **No video** |

## Outcome

**No videos.** Eight for eight.

The one case that nearly earned one — hydrology's amplification sweep — argues for a *continuous*
beat rather than a rendered file, because being able to scrub it back and forth is the part that
teaches. That is a scene change, not a video, and it is recorded here as the strongest candidate if
this is revisited.

The reference videos' actual lesson was never the codec. It was the pacing: a static composition
that is already frame zero, scroll as bidirectional time, a rest frame the reader can stop on, and
separation along the axis a thing was attached on. All four are in the scenes, and none of them
required shipping a megabyte.
