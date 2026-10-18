# The look, and why it is this one

Written before the redesign, so the choices can be argued with rather than
discovered in the CSS. The brief: professional first, tasteful motion, to the
standard a German employer or a TUM professor expects, in the same palette as
the GitHub profile, light and dark.

## What this site is actually about

Every project here is about the same thing, and it took writing them in a row
to see it.

| Project | What it is really about |
|---|---|
| The thesis | A model that says how confident it is, and is right about that |
| MCP policy gateway | What a system refuses, and what it wrongly refuses |
| InsureAssist | Which change earned which gain, isolated |
| Munich forecasting | A published margin that does not survive an ordinary year |
| Drift platform | The thing that moved was the target, not the features |
| MLOps pipeline | A promotion gate that can say no |

The owner's own line for it: *I build systems that report honestly on what they
do not know.*

So the subject of this portfolio is not machine learning. It is **doubt, measured**.
That is unusual enough to design around, and it is specific to this person
rather than to the genre.

## The device: the interval, not the point

A calibrated prediction is not a number. It is a number with a range around it,
and the whole thesis is about making that range honest.

So the structural device of this site is the **interval**: wherever a published
figure appears, it carries the thing that qualifies it, in the same visual unit.
A value with its measured range. A result with the file it is checked against. A
claim with its boundary.

This replaces the usual portfolio device, which is the big confident number with
a small label under it. That treatment is the default for any page of this kind,
and on this subject it would also be a lie.

**Rule it has to earn.** No figure on this site is published bare. If nothing
qualifies it, that is itself the thing to say.

## Colour

The same six the GitHub profile uses, because the two surfaces should read as
one person's work.

| Token | Light | Dark | Job |
|---|---|---|---|
| `--paper` | `#F7F8FA` | `#10151C` | the ground |
| `--ink` | `#1C2430` | `#E6EBF2` | text |
| `--violet` | `#7A6BA8` | `#A99CD6` | research, the thesis |
| `--blue` | `#4C7CAE` | `#87AEDA` | engineering, industry |
| `--teal` | `#4E9A92` | `#82C0B8` | measurement, results |
| `--rose` | `#B0607A` | `#D4909F` | the return path, a refusal, a caveat |

Rose is not decoration: it is the colour the system diagram already gives to the
three dashed arrows that go backwards, and on this site it marks the same idea,
the place where the work turns round and argues with itself.

The ground is a cool blue-grey, not the warm cream this kind of page usually
takes, and the dark ground is `#10151C` rather than a tinted near-black, which
keeps it in the same family as the profile's `#1C2430` chips.

## Type

**Archivo** and **IBM Plex Mono**, self-hosted, subset to Latin-1. The same pair
the profile's animations and the system diagram are set in.

Archivo is a variable font with a **width** axis as well as weight, and the
headings use it: display sizes are set wide, body is set normal. Most pages
cannot vary width, and it gives the headings a voice without reaching for a
second family.

**Mono is for data only**: numerals, file paths, identifiers, code. It never
sets a label or a heading. A monospace label is one of the commonest tells of a
generated page, and here it would also be wrong, because on this site mono means
"this is a measured thing".

Prose sets to a 68 character measure. Nothing is centred.

## Layout

Left-aligned, asymmetric. A narrow rail carries where you are; a wide column
carries the content. The rail is not decoration either: it is the one piece of
persistent orientation on a long page.

```
 rail        content column
 ----        --------------------------------------
 |           Uncertainty for a traffic surrogate
 |           -------------------------------------
 |           A graph network predicts how Paris
 |  Research traffic shifts when a lane closes.
 |
 |           0.269 |-----o-----| 0.048
 |                 calibration error, after scaling
 |                 verify_headline_results.py
 ----        --------------------------------------
```

## Motion

**One orchestrated moment, on the home page, and nothing else that moves by
itself.** The Paris road network draws in once, and the hero's uncertainty band
narrows from its raw width to its calibrated one. That is the thesis, performed
in two seconds, and then it stops.

Everything else moves only in answer to something the reader did: an experience
entry opening, the theme changing, a disclosure expanding. Fade-and-slide-up on
every section and a hover transform on every card is the generic default and
reads as machine-made.

`prefers-reduced-motion` removes the hero animation entirely and leaves the
final frame, which is the informative one.

## What this deliberately is not

- Not a warm cream page with a high-contrast serif and a clay accent.
- Not a near-black page with one acid accent.
- Not a grid of identical rounded cards with the same soft shadow under each.
- No tracked-out capital labels above headings, no meta strings joined with
  middle dots, no arrow glyph appended to a link. The last two are banned by the
  character rule anyway, which is a rule about honesty in prose that happens to
  also forbid three of the commonest visual tells.
