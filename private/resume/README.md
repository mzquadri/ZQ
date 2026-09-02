# Private resume artifacts

The site publishes no resume: there is no `/resume` route, no navigation entry, no download
action and no sitemap entry, and the generator that produced the PDF was retired along with
the route it rendered. `tests/portfolio.spec.ts` asserts all of that against the built site.

**The PDF is no longer in this repository, including its history.**

## Why it was removed rather than just moved

An earlier version of this file said the PDF was "not reachable by URL" because it had been
moved out of `public/`. That was true of the site and false of the repository. The file was
served at `raw.githubusercontent.com` with an HTTP 200, and `git clone` handed over eight
versions of it — the one under `private/`, plus seven older ones still reachable in history
from when it lived in `public/`.

Moving a file between directories does not remove it from git. On 2 Sep 2026 all eight blobs
were purged from every commit with `git filter-repo`, and the result was force-pushed.

Anyone who cloned or forked before that date still holds the old objects. That is not
recoverable, and it is the reason a private document should not be committed to a public
repository in the first place, whatever directory it sits in.

## What is left here

`mohd-zamin-quadri-resume.manifest.json` — the SHA-256 digests of the source and the PDF, kept
as a record of what the retired generator produced. It names a document that is no longer here.

The PDF itself is held outside this repository.
