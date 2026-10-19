# Withheld pages

Finished pages that are deliberately not routed, kept here so they are not
rewritten from scratch when the thing blocking them clears.

A file here is not a draft. It built and rendered; it is withheld for a reason
stated below, and restoring it is a move plus a footer link.

## `impressum-page.tsx.withheld`

**Withheld on 19 October 2026, by the owner, until a c/o postal address exists.**

It was published with every field filled except the address, which was marked in
the page as missing. The owner's judgement, and it is the right one: a visibly
incomplete Impressum is worse than none, because the page's whole purpose is to
be the complete statement of who is responsible, and one that announces a gap
invites exactly the Abmahnung it was meant to prevent.

`docs/IMPRESSUM_ASSESSMENT.md` has the legal position: Paragraph 5 DDG, why a
Postfach will not do, why the thirteen articles pull towards Paragraph 18 MStV
regardless of the commercial question, and the four options.

**To restore it:** move the file back to `src/app/impressum/page.tsx`, fill in
the address block, and add the footer link back beside Datenschutz in
`src/components/SiteFooter.tsx`. Nothing else references the route.

Datenschutz stays live and needs no address.
